import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatIconModule } from "@angular/material/icon";
import { Store } from "@ngrx/store";
import { environment } from '../../../environments/environment'; // ✅ importa environment
import { AppState } from "../../app.config";
import { getDomainImages } from "../../core/profile/store/profile.selectors";
import { getRouterUrl } from "../../core/router/store/router.selectors";
import { sidebarRoutes } from "../../core/ui/services/sidebar.routes";
import { uiSetSidebarCollapseState } from "../../core/ui/store/ui.actions";
import { selectUISidebarCollapsed } from "../../core/ui/store/ui.selectors";
import { IfLoggedDirective } from "../../shared/directives/if-logged.directive";
import { FooterComponent } from "./components/footer/footer.component";
import { MenuComponent } from "./components/menu/menu.component";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ CommonModule, IfLoggedDirective, MatIconModule, FooterComponent, MenuComponent ],
  template: `
    <div *fbIfLogged>
      <aside class="flex flex-col justify-between p-2.5 h-screen duration-700 ease-in-out select-none"
             [ngClass]="{
                'w-[5em]': collapsed,
                'w-[15em]': !collapsed
             }">

        <!-- Logo -->
        <div *ngIf="domainImages$ | async as domainImages"
             class="h-[3.5rem] min-h-[3.5rem] flex items-center"
             [ngClass]="{
                'bg-collapsed-logo': collapsed,
                'bg-extended-logo': !collapsed
             }"
             [ngStyle]="{
                backgroundImage: collapsed
                  ? 'url(' + baseUrl + '/media/' + domainImages.icon + ')'
                  : 'url(' + baseUrl + '/media/' + domainImages.logo + ')'
             }">
        </div>
        <!-- End Logo -->

        <app-menu class="pt-2.5 flex flex-col gap-2 overflow-y-scroll grow mx-[-10px] px-[10px] pb-[10px]"></app-menu>
        <app-footer [collapsed]="collapsed"/>
      </aside>
    </div>
  `,
  styles: [ `
    .bg-extended-logo {
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }
    .bg-collapsed-logo {
      @extend .bg-extended-logo;
    }
  ` ]
})
export class SidebarComponent {
  store: Store<AppState> = inject(Store);
  collapsed: boolean | undefined = undefined;
  activeRoute$ = this.store.select(getRouterUrl);
  domainImages$ = this.store.select(getDomainImages);

  baseUrl = environment.BASE_URL;

  @HostListener('window:resize', [ '$event' ])
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
