import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { AppState } from "../../../../app.config";
import { ShowImageComponent } from "../../../../components/show-image/show-image.component";
import { getProfileUser } from "../../../../core/profile/store/profile.selectors";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { User } from "../../../../models/User";
import { HideByCodeSelectorDirective } from "../../../../shared/directives/hide-by-code-selector.directive";

@Component({
  selector: 'app-view-settings',
  standalone: true,
  imports: [ CommonModule, ShowImageComponent, MatIconModule, HideByCodeSelectorDirective ],
  template: `
    <div class="flex flex-col gap-2">
      <div class="flex flex-row gap-4" *ngIf="profile$ | async as profile">
        <div class="flex flex-col basis-1/6">
          <app-show-image [imageUrl]="profile?.photo || ''" [objectName]="profile?.name || ''"/>
        </div>

        <div class="flex flex-col justify-between basis-1/6">
          <div>
            <button
              class="inline-flex gap-1 items-center text-sm font-bold bg-foreground rounded-md px-4 py-1 default-shadow-hover"
              (click)="navigateToEdit(profile?.id)">
              <mat-icon class="material-symbols-rounded-filled">edit</mat-icon>
              Modifica
            </button>

            <button
              class="inline-flex gap-1 items-center text-sm font-bold rounded-md px-4 py-1 default-shadow-hover red-buttons ml-2"
              (click)="navigateToDelete()">
              <mat-icon class="material-symbols-rounded-filled">delete</mat-icon>
              Elimina
            </button>
            <div class="text-4xl pt-6 pb-4"> {{ profile.name }}</div>
            <div class="text-2xl"> {{ profile.surname }}</div>
          </div>
          <div class="text-sm"> {{ "taf v. " + appVersion }}</div>
        </div>
      </div>
      <div *fbHideByCodeSelector="'settings.users.button-list'" (click)="navigateToUsers()"
           class="flex items-center justify-between text-md bg-foreground rounded-md p-3 cursor-pointer default-shadow">
        <div class="flex items-center gap-2">
          <mat-icon class="icon-size material-symbols-rounded cursor-pointer">groups</mat-icon>
          Utenti
        </div>
        <div class="flex align-center">
          <mat-icon class="icon-size material-symbols-rounded cursor-pointer">arrow_forward</mat-icon>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export default class ViewSettingsComponent {
  store: Store<AppState> = inject(Store);
  profile$: Observable<Partial<User>> = this.store.select(getProfileUser);
  appVersion: string = environment.appVersion;

  navigateToEdit(id: string | undefined) {
    this.store.dispatch(RouterActions.go({ path: [ `users/${ id }` ] }));
  }

  navigateToUsers() {
    this.store.dispatch(RouterActions.go({ path: [ `users` ] }));
  }

  navigateToDelete() {
  this.store.dispatch(RouterActions.go({ path: [ 'delete-account' ] }));
}
}
