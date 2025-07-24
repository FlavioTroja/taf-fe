import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { sidebarRoutes } from "../../../../core/ui/services/sidebar.routes";
import { IfForbiddenDirective } from "../../../../shared/directives/if-forbidden.directive";
import { RouteElementComponent } from "../route-element/route-element.component";
import { getRouterUrl } from "../../../../core/router/store/router.selectors";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [ CommonModule, IfForbiddenDirective, RouteElementComponent ],
  template: `
    <ng-template ngFor let-item="$implicit" [ngForOf]="sidebarRoutes"
                 *ngIf="(activeRoute$ | async) as activeRoute">
      <app-route-element *fbIfForbidden="item.provideRoles" [route]="item" [activeRoute]="activeRoute"/>
    </ng-template>
  `,
  styles: []
})
export class MenuComponent {
  store: Store<AppState> = inject(Store);
  activeRoute$ = this.store.select(getRouterUrl);

  protected readonly sidebarRoutes = sidebarRoutes;
}
