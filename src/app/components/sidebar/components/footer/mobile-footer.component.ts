import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { toSignal } from "@angular/core/rxjs-interop";
import { getProfileUser } from "../../../../core/profile/store/profile.selectors";
import * as RouterActions from "../../../../core/router/store/router.actions";
import * as AuthActions from "../../../../core/auth/store/auth.actions";
import { MatIconModule } from "@angular/material/icon";
import { ButtonSquareComponent } from "../../../button-square/button-square.component";

@Component({
  selector: 'app-mobile-footer',
  standalone: true,
  imports: [CommonModule, MatIconModule, NgOptimizedImage, ButtonSquareComponent],
  template: `
      <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2 justify-center items-center">
              <img class="rounded-full" width="48" height="48" [ngSrc]="getProfileImage()" alt="profile picture" priority>
              <div class="font-bold"> {{ profile()!.username }} </div>
          </div>
          <div class="flex flex-col gap-2">
              <button class="flex gap-2 justify-center items-center text-sm font-bold bg-foreground rounded-md px-4 py-2 default-shadow-hover cursor-pointer"
                      (click)="goToSettings()">
                  <mat-icon class="icon-size material-symbols-rounded-filled cursor-pointer">settings</mat-icon>
                  Impostazioni
              </button>
              <button class="flex gap-2 justify-center items-center text-sm font-bold error rounded-md px-4 py-2 default-shadow-hover cursor-pointer"
                      (click)="logout()">
                  <mat-icon class="icon-size material-symbols-rounded-filled cursor-pointer">logout</mat-icon>
                  Logout
              </button>
          </div>
      </div>
  `,
  styles: [
  ]
})
export class MobileFooterComponent {
  store: Store<AppState> = inject(Store);
  profile = toSignal(this.store.select(getProfileUser));

  getProfileImage() {
    if (!this.profile()) {
      return "";
    }
    return this.profile()!.avatarUrl ? this.profile()!.avatarUrl! : `https://eu.ui-avatars.com/api/?name=${this.profile()?.username}&rounded=true&size=48`;
  }

  goToSettings() {
    this.store.dispatch(RouterActions.go({ path: [ "/settings" ] }));
  }

  logout() {
    this.store.dispatch(AuthActions.logout())
  }

}
