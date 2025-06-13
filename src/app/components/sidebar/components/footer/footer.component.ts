import { Component, inject, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { uiToggleSidebarCollapsed } from "../../../../core/ui/store/ui.actions";
import * as AuthActions from "../../../../core/auth/store/auth.actions";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { toSignal } from "@angular/core/rxjs-interop";
import { getProfileUser } from "../../../../core/profile/store/profile.selectors";
import * as RouterActions from "../../../../core/router/store/router.actions";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatIconModule, NgOptimizedImage],
  template: `
    <div class="flex justify-between items-center duration-700 ease-in-out pt-2 gap-2" [ngClass]="{
      'flex-col-reverse': collapsed,
      'flex-row': !collapsed
      }">
      <div class="flex gap-2">
        <img class="rounded-full" width="48" height="48" [ngSrc]="getProfileImage()" priority>
        <div class="flex flex-col" *ngIf="!collapsed">
          <div class="font-bold"> {{ profile()!.username }} </div>
          <div class="flex gap-1.5 text-xs cursor-pointer">
            <div class="opacity-50 hover:opacity-100 duration-100 ease-in-out" (click)="goToSettings()"> Settings</div>
            <div class="opacity-50 hover:opacity-100 duration-100 ease-in-out" (click)="logout()"> Logout</div>
          </div>
        </div>
      </div>
      <mat-icon
        class="icon-size material-symbols-rounded-filled cursor-pointer opacity-50 hover:opacity-100 duration-700 ease-in-out"
        (click)="toggle()" [ngClass]="{
      'rotate-0': collapsed,
      'rotate-180': !collapsed
      }">double_arrows
      </mat-icon>
    </div>
  `,
  styles: [
  ]
})
export class FooterComponent {

  store: Store<AppState> = inject(Store);
  @Input({ required: true }) collapsed: boolean | undefined = undefined;
  profile = toSignal(this.store.select(getProfileUser));

  toggle() {
    this.store.dispatch(uiToggleSidebarCollapsed());
  }

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
