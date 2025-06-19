import { animate, style, transition, trigger } from "@angular/animations";
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from "@angular/core/rxjs-interop";
import { MatIconModule } from "@angular/material/icon";
import { NavigationEnd, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { AppState } from "../../app.config";
import { getProfileUser } from "../../core/profile/store/profile.selectors";
import * as RouterActions from "../../core/router/store/router.actions";
import { go } from "../../core/router/store/router.actions";
import { IfLoggedDirective } from "../../shared/directives/if-logged.directive";
import { ButtonComponent } from "../button/button.component";
import { MobileFooterComponent } from "./components/footer/mobile-footer.component";
import { MenuComponent } from "./components/menu/menu.component";

const ANIMATION_DURATION = "300ms";
const ANIMATION_CURVE = "cubic-bezier(0.85, 0, 0.15, 1)";

@Component({
  selector: 'app-mobile-navbar',
  standalone: true,
  imports: [ CommonModule, MenuComponent, MatIconModule, ButtonComponent, MobileFooterComponent, NgOptimizedImage, IfLoggedDirective ],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(5em)' }),
        animate(`${ ANIMATION_DURATION } ${ ANIMATION_CURVE }`, style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate(`${ ANIMATION_DURATION } ${ ANIMATION_CURVE }`, style({ opacity: 0, transform: 'translateY(5em)' }))
      ])
    ])
  ],
  template: `
    <div class="navbar fixed w-screen backdrop-blur-md p-3.5 flex flex-col justify-between"
         [ngClass]="{ 'h-screen': isMenuOpen || isProfileOpen }" *fbIfLogged>
      <div class="grow overflow-y-auto pt-24 mx-[-10px] px-[10px]" *ngIf="isMenuOpen" @fadeAnimation>
        <app-menu class="flex flex-col gap-2"></app-menu>
      </div>
      <div class="grow overflow-y-auto pt-24 mx-[-10px] px-[10px]" *ngIf="isProfileOpen" @fadeAnimation>
        <app-mobile-footer></app-mobile-footer>
      </div>
      <div class="flex flex-row justify-around items-center">
        <mat-icon class="material-symbols-rounded-filled" (click)="toggleMenu()">
          {{ isMenuOpen ? 'close' : 'menu' }}
        </mat-icon>
        <app-button iconName="home" label="" (click)="goHome()"/>
        <img class="rounded-full" width="28" height="28" [ngSrc]="getProfileImage()" (click)="toggleProfile()"
             alt="profile" priority>
      </div>
    </div>
  `,
  styles: [ `
    .navbar {
      bottom: env(safe-area-inset-bottom);
    }
  ` ]
})
export class MobileNavbarComponent implements OnInit {
  store: Store<AppState> = inject(Store);
  profile = toSignal(this.store.select(getProfileUser));

  isMenuOpen: boolean = false;
  isProfileOpen: boolean = false;

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isMenuOpen = false;
        this.isProfileOpen = false;
      }
    });
  }

  getProfileImage() {
    if (!this.profile()) {
      return "";
    }
    return this.profile()!.photo ? this.profile()!.photo! : `https://eu.ui-avatars.com/api/?name=${ this.profile()?.name }&rounded=true&size=28`;
  }

  goHome() {
    this.store.dispatch(RouterActions.go({ path: [ "" ] }));
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.isProfileOpen = false;
  }

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
    this.isMenuOpen = false;
  }

  protected readonly go = go;
}
