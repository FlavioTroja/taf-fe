import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { sidebarRoutes } from "../../../../core/ui/services/sidebar.routes";
import { IfForbiddenDirective } from "../../../../shared/directives/if-forbidden.directive";
import { RouteElementComponent } from "../route-element/route-element.component";
import { getRouterUrl } from "../../../../core/router/store/router.selectors";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { HideByCodeSelectorDirective } from "../../../../shared/directives/hide-by-code-selector.directive";

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [ CommonModule, IfForbiddenDirective, RouteElementComponent, HideByCodeSelectorDirective ],
  template: `
    <ng-template ngFor let-item="$implicit" [ngForOf]="sidebarRoutes"
                 *ngIf="(activeRoute$ | async) as activeRoute">
        <app-route-element *fbHideByCodeSelector="item.roleSelector || ''" [route]="item" [activeRoute]="activeRoute"/>
    </ng-template>
  `,
  styles: [
  ]
})
export class MenuComponent {
  store: Store<AppState> = inject(Store);
  activeRoute$ = this.store.select(getRouterUrl);

  protected readonly sidebarRoutes = sidebarRoutes;
}
