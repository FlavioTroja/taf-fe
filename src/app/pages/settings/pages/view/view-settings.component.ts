import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShowImageComponent } from "../../../../components/show-image/show-image.component";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { User } from "../../../../models/User";
import { getProfileUser } from "../../../../core/profile/store/profile.selectors";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { MatIconModule } from "@angular/material/icon";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { HideByCodeSelectorDirective } from "../../../../shared/directives/hide-by-code-selector.directive";

@Component({
  selector: 'app-view-settings',
  standalone: true,
  imports: [CommonModule, ShowImageComponent, MatIconModule, HideByCodeSelectorDirective],
  template: `
    <div class="flex flex-col gap-2">
      <div class="flex flex-row gap-4" *ngIf="profile$ | async as profile">
        <div class="flex flex-col basis-1/6">
          <app-show-image [imageUrl]="profile?.avatarUrl || ''" [objectName]="profile?.username || ''"/>
        </div>

        <div class="flex flex-col justify-between basis-1/6">
          <div>
            <button class="flex gap-1 items-center text-sm font-bold bg-foreground rounded-md px-4 py-1 default-shadow-hover cursor-pointer"
                    (click)="navigateToEdit(profile?.id)">
              <mat-icon class="icon-size material-symbols-rounded-filled cursor-pointer">edit</mat-icon>
              Modifica
            </button>
            <div class="text-4xl pt-6 pb-4"> {{ profile.username }} </div>
            <div class="text-2xl"> {{ profile.email }} </div>
          </div>
          <div class="text-sm"> {{ "Soko v. "+ appVersion }} </div>
        </div>
      </div>
      <div *fbHideByCodeSelector="'settings.users.button-list'" (click)="navigateToUsers()" class="flex items-center justify-between text-md bg-foreground rounded-md p-3 cursor-pointer default-shadow">
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
  styles: [
  ]
})
export default class ViewSettingsComponent {
  store: Store<AppState> = inject(Store);
  profile$: Observable<Partial<User>> = this.store.select(getProfileUser);
  appVersion: string = environment.appVersion;

  navigateToEdit(id: number | undefined) {
    this.store.dispatch(RouterActions.go({ path: [`users/${id}`] }));
  }

  navigateToUsers() {
    this.store.dispatch(RouterActions.go({ path: [`users`] }));
  }
}
