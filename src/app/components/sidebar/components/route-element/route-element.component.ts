import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { RouteElement } from "../../../../core/ui/services/sidebar.routes";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { ExpandRouteElementComponent } from "../expand-route-element/expand-route-element.component";
import { toSignal } from "@angular/core/rxjs-interop";
import { selectUISidebarExpandedPath, selectUISidebarCollapsed } from "../../../../core/ui/store/ui.selectors";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { HideByCodeSelectorDirective } from "../../../../shared/directives/hide-by-code-selector.directive";

@Component({
  selector: 'app-route-element',
  standalone: true,
  imports: [CommonModule, MatIconModule, ExpandRouteElementComponent, HideByCodeSelectorDirective],
  template: `
    <div class="flex flex-col bg-75 items-center rounded-md" [ngClass]="{
        'default-shadow-hover': expandedPath() === route.path
        }">
      <div class="flex justify-center w-full h-14 bg-foreground items-center rounded-md p-2 gap-2 cursor-pointer default-shadow-hover"
           (click)="route.isOpenOnly ? toggleExpandRoute($event) : goOnRoute()">
        <div class="flex w-9">
          <mat-icon class="icon-size" [ngClass]="{
        'material-symbols-rounded-filled': isSelected || hasChildWithPath,
        'material-symbols-rounded': !isSelected
        }">{{ route.iconName }}</mat-icon>
        </div>
        <div class="grow" *ngIf="!(collapsed | async)" [ngClass]="{
        'font-bold': isSelected || hasChildWithPath,
        }">
          <div class="flex justify-between">
            {{ route.label }}
            <mat-icon (click)="toggleExpandRoute($event)" class="material-symbols-rounded z-10"
                      [ngClass]="{'rotate-180 duration-300 ease-in-out': expandedPath() === route.path}"
                      *ngIf="!!route.children?.length">expand_more
            </mat-icon>
          </div>
        </div>
      </div>

      <div class="w-full p-1" *ngIf="expandedPath() === route.path">
        <ng-template ngFor let-item="$implicit" [ngForOf]="route.children">
          <app-expand-route-element *fbHideByCodeSelector="item.roleSelector || ''" [route]="item" [activeRoute]="activeRoute"/>
        </ng-template>
      </div>
    </div>

    <div *ngIf="route.isLast" class="bg-separator"></div>
  `,
  styles: [`
  .icon-size {
    font-size: 32px;
    width: auto;
    height: auto;
  }
  .bg-75 {
    background-color: rgba(var(--foreground-color), 0.75);
  }

  .bg-separator{
    background-color: rgba(var(--primary-color), 0.1);
    height: 2px;
    border-radius: 999px;
    width: 100%;
    margin-top: 0.5rem;
  }
  `]
})
export class RouteElementComponent {
  @Input({ required: true }) route: Partial<RouteElement> = {};
  @Input({ required: true }) activeRoute: string = "";
  store: Store<AppState> = inject(Store);
  collapsed = this.store.select(selectUISidebarCollapsed);
  expandedPath = toSignal(this.store.select(selectUISidebarExpandedPath));
  get isSelected() {
    return this.activeRoute?.includes(this.route?.path || "");
  }

  // Verifica se la rotta corrente è compresa nei propri figli
  get hasChildWithPath() {
    return this.route.children?.some(child => child.path === this.activeRoute);
  }

  goOnRoute() {
    const path = this.route.path;
    if (!this.route.path) {
      return;
    }
    if(!!this.route.children?.length) {
      this.store.dispatch(UIActions.uiToggleSidebarExpandRoute({ expand: { path: path ?? "" } }));
    }
    if(this.expandedPath() !== path) {
      this.store.dispatch(UIActions.uiToggleSidebarExpandRoute({
        expand: undefined
      }));
    }
    this.store.dispatch(RouterActions.go({ path: [ path ?? "" ] }));
  }

  toggleExpandRoute(event: any) {
    event.stopPropagation();
    this.store.dispatch(UIActions.uiToggleSidebarExpandRoute({
      expand: this.route.path === this.expandedPath() ? undefined : {
        path: this.route.path ?? ""
      }
    }));
  }

}
