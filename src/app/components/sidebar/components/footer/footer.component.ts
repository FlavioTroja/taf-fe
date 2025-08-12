import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { toSignal } from "@angular/core/rxjs-interop";
import { MatIconModule } from "@angular/material/icon";
import { Store } from "@ngrx/store";
import { environment } from "../../../../../environments/environment";
import { AppState } from "../../../../app.config";
import * as AuthActions from "../../../../core/auth/store/auth.actions";
import { getProfileUser } from "../../../../core/profile/store/profile.selectors";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { uiToggleSidebarCollapsed } from "../../../../core/ui/store/ui.actions";
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [ CommonModule, MatIconModule, NgOptimizedImage ],
  template: `
    <div class="flex justify-between items-center duration-700 ease-in-out pt-2 gap-2" [ngClass]="{
      'flex-col-reverse': collapsed,
      'flex-row': !collapsed
      }">
      <div class="flex gap-2">
        <img class="rounded-full" width="48" height="48" [ngSrc]="getProfileImage()" priority>
        <div class="flex flex-col" *ngIf="!collapsed">
          <div class="font-bold"> {{ profile()!.name }}</div>
          <div class="flex gap-1.5 text-xs cursor-pointer">
            <div class="opacity-50 hover:opacity-100 duration-100 ease-in-out" (click)="goToSettings()"> Settings</div>
            <div class="opacity-50 hover:opacity-100 duration-100 ease-in-out" (click)="logout()"> Logout</div>
          </div>
        </div>
      </div>
      <div class="relative cursor-pointer" (click)="goToNotifications()">
        <mat-icon
          class="material-symbols-rounded opacity-50 hover:opacity-100 duration-700 ease-in-out"
        >notifications
        </mat-icon>
        <!--        <div class="flex absolute top-0 right-0 icon-error text-2xs text-white text-center rounded-full px-1 py-px">
                  {{ 12 }}
                </div>-->
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
  styles: []
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
    return this.profile()!.photo ? `${environment.BASE_URL}/media/${ this.profile()!.photo! }` : `https://eu.ui-avatars.com/api/?name=${ this.profile()?.name }&rounded=true&size=48`;
  }

  goToSettings() {
    this.store.dispatch(RouterActions.go({ path: [ "/settings" ] }));
  }

  goToNotifications() {
    this.store.dispatch(RouterActions.go({ path: [ "/notifications/sent" ] }));
  }

  logout() {
    this.store.dispatch(AuthActions.logout())
  }
}
