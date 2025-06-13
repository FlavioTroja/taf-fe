import {Component, HostListener, inject} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Store } from "@ngrx/store";
import { AppState } from "../../app.config";
import { IfLoggedDirective } from "../../shared/directives/if-logged.directive";
import { RouteElementComponent } from "./components/route-element/route-element.component";
import { sidebarRoutes } from "../../core/ui/services/sidebar.routes";
import { getRouterUrl } from "../../core/router/store/router.selectors";
import { MatIconModule } from "@angular/material/icon";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { selectUISidebarCollapsed } from "../../core/ui/store/ui.selectors";
import { FooterComponent } from "./components/footer/footer.component";
import { IfForbiddenDirective } from "../../shared/directives/if-forbidden.directive";
import { MenuComponent } from "./components/menu/menu.component";
import { uiSetSidebarCollapseState } from "../../core/ui/store/ui.actions";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, IfLoggedDirective, NgOptimizedImage, RouteElementComponent, MatIconModule, FooterComponent, IfForbiddenDirective, MenuComponent],
  template: `
    <div *fbIfLogged>
      <aside class="flex flex-col justify-between p-2.5 h-screen duration-700 ease-in-out select-none" [ngClass]="{
      'w-[5em]': collapsed,
      'w-[15em]': !collapsed
      }">
          <!--        Logo-->
          <div class="h-[3.5rem] min-h-[3.5rem] flex items-center" [ngClass]="{
            'bg-collapsed-logo': collapsed,
            'bg-extended-logo': !collapsed
          }">

          </div>
          <!--        End Logo-->
          <app-menu class="pt-2.5 flex flex-col gap-2 overflow-y-scroll grow mx-[-10px] px-[10px] pb-[10px]"></app-menu>

          <app-footer [collapsed]="collapsed" />
      </aside>
    </div>
  `,
  styles: [`
  .bg-extended-logo {
    background-image: url("../../../assets/images/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  .bg-collapsed-logo {
    @extend .bg-extended-logo;
    background-image: url("../../../assets/images/collapsed-logo.png");
  }
  `]
})
export class SidebarComponent {
  store: Store<AppState> = inject(Store);
  collapsed: boolean | undefined = undefined;
  activeRoute$ = this.store.select(getRouterUrl);

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth < 1100) {
      return this.store.dispatch(uiSetSidebarCollapseState({ value: true }));
    }
    this.store.dispatch(uiSetSidebarCollapseState({ value: false }));

  }

  constructor() {
    this.store.select(selectUISidebarCollapsed).pipe(
      takeUntilDestroyed()
    ).subscribe(value => this.collapsed = value);
  }

  protected readonly sidebarRoutes = sidebarRoutes;
}
