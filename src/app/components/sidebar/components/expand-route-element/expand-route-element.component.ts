import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteElement } from "../../../../core/ui/services/sidebar.routes";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { MatIconModule } from "@angular/material/icon";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { selectUISidebarCollapsed } from "../../../../core/ui/store/ui.selectors";

@Component({
  selector: 'app-expand-route-element',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex justify-center h-14 items-center p-2 gap-1 cursor-pointer rounded-md bg-hover" (click)="onClick()">
      <div class="flex">
        <mat-icon class="icon-size" [ngClass]="{
      'material-symbols-rounded-filled': activeRoute === route.path,
      'material-symbols-rounded': activeRoute !== route.path
      }">{{ route.iconName }}</mat-icon>
      </div>
      <div class="grow" *ngIf="!(collapsed | async)" [ngClass]="{
      'font-bold': activeRoute === route.path
      }">
        <div class="flex justify-between">
          {{ route.label }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .icon-size {
      font-size: 32px;
      width: auto;
      height: auto;
    }
  `]
})
export class ExpandRouteElementComponent {
  @Input({ required: true }) route: Partial<RouteElement> = {};
  @Input({ required: true }) activeRoute: string = "";

  store: Store<AppState> = inject(Store);
  collapsed = this.store.select(selectUISidebarCollapsed);

  onClick() {
    this.store.dispatch(RouterActions.go({ path: [ this.route.path ?? "" ] }));
  }
}
