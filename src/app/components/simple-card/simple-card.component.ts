import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app.config';
import * as RouterActions from "../../core/router/store/router.actions";
import { HideByCodeSelectorDirective } from "../../shared/directives/hide-by-code-selector.directive";

export interface SimpleCardItem {
  iconName: string,
  label: string,
  path: string,
  roleSelector?: string,
}

@Component({
  selector: 'app-simple-card',
  standalone: true,
  imports: [ CommonModule, MatIconModule, HideByCodeSelectorDirective ],
  template: `
    <div
      *fbHideByCodeSelector="item.roleSelector || ''"
      class="w-full p-2 sm:w-44 sm:h-44 bg-foreground default-shadow-hover rounded-md text-center flex flex-row sm:flex-col content-evenly items-center justify-start sm:justify-around cursor-pointer gap-2"
      (click)="goToRoute(item.path)">
      <div class="h-5"></div>
      <mat-icon class="material-symbols-rounded -ml-2 sm:ml-0" [ngStyle]="{ 'width': '60px', 'height': '60px', 'font-size': '60px' }"> {{ item.iconName }}</mat-icon>
      <div class="text-lg sm:text-base">
        {{ item.label }}
      </div>
    </div>
  `,
  styles: [
  ]
})
export class SimpleCardComponent {
  @Input({ required: true }) item!:SimpleCardItem
  store: Store<AppState> = inject(Store);

  goToRoute(path: string) {
    if (!path) {
      return;
    }
    this.store.dispatch(RouterActions.go({ path: [ path ?? "" ] }));
  }

}


