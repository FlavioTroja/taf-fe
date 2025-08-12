import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import { Store } from "@ngrx/store";
import { AppState } from "../../../app.config";
import { InputComponent } from "../../../components/input/input.component";

import { environment } from '../../../../environments/environment';
import * as AuthActions from "../../../core/auth/store/auth.actions";
import { getAccessToken, getAuthError, getAuthLoading } from "../../../core/auth/store/auth.selectors";
import { getDomainImages } from "../../../core/profile/store/profile.selectors";
import { LoginPayload } from "../../../models/Auth";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ CommonModule, FormsModule, MatIconModule, ReactiveFormsModule, InputComponent, RouterLink ],
  template: `
    <div class="page-layout"> <!-- was min-h-screen -->
      <!-- HEADER -->
      <header class="m-auto w-full max-w-screen-xl px-4 pt-6 flex items-center justify-between">
        <img
          [src]="profileImages()?.logo ? '${environment.BASE_URL}/media/' + profileImages()?.logo : ''"
          class="h-14"
          alt="Logo"
        />
      </header>

      <!-- MAIN -->
      <main class="grow m-auto w-full max-w-[28rem] px-4 py-12 md:py-16 flex flex-col gap-6 items-center">
        <h1 class="text-3xl font-extrabold">Accedi</h1>

        <form class="contents" [formGroup]="loginFormGroup" (ngSubmit)="login()">
          <div class="w-full">
            <app-input
              formControlName="usernameOrEmail"
              label="e-mail o nome utente"
              id="usernameOrEmail"
              type="text"
            />
          </div>

          <div class="w-full">
            <label
              for="password"
              class="text-md block px-3 py-0 font-medium"
              [ngClass]="f.password.invalid && f.password.dirty ? 'text-red-800' : 'text-gray-900'">
              password
            </label>

            <div class="relative">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                class="focus:outline-none p-3 rounded-md pr-12 w-full"
                [ngClass]="f.password.invalid && f.password.dirty ? 'border-input-error' : 'border-input'"
                formControlName="password"
                autocomplete="current-password"
              />

              <button
                (click)="togglePassword()"
                type="button"
                class="absolute end-1 rounded-lg text-sm px-4 py-3 items-center"
                aria-label="Mostra/Nascondi password">
                <mat-icon class="material-symbols-rounded">
                  visibility{{ showPassword ? '_off' : '' }}
                </mat-icon>
              </button>
            </div>

            <div *ngIf="f.password.invalid && f.password.dirty" class="px-3 py-1 text-xs text-red-800">
              Il campo 'password' è obbligatorio.
            </div>
          </div>

          <div *ngIf="!!error()" class="flex w-full rounded-lg bg-red-200 p-2 text-sm text-red-800" role="alert">
            <div class="flex flex-row gap-2 items-center">
              <mat-icon class="material-symbols-rounded-filled">warning</mat-icon>
              <span class="sr-only">Errore</span>
              <p class="break-words">{{ error()?.error?.error }}</p>
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loginFormGroup.invalid"
            [ngClass]="{ 'opacity-50': loginFormGroup.invalid }"
            class="flex items-center gap-1 rounded-full icon-accent px-12 py-3 font-extrabold text-white shadow-md hover:bg-cyan-950">
            Entra
            <mat-icon *ngIf="!!(isLoading | async)"
                      class="icon-size material-symbols-rounded-filled cursor-pointer animate-spin duration-700 ease-in-out">
              progress_activity
            </mat-icon>
          </button>
        </form>

        <div>Non hai un account? <a class="underline text-accent hover:text-cyan-950 cursor-pointer" [routerLink]="'/auth/register'">Registrati</a></div>
        <div class="text-center">
          Hai bisogno di confermare l'account?
          <a class="underline text-accent hover:text-cyan-950 cursor-pointer" [routerLink]="'/auth/confirm'">Vai alla conferma</a>
        </div>
      </main>

      <!-- FOOTER -->
      <footer class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t px-4 py-3">
        <div class="m-auto w-full max-w-screen-xl text-sm flex flex-wrap items-center justify-between gap-2">
          <span class="opacity-70">&copy; {{ currentYear }} — Tutti i diritti riservati</span>
          <a class="underline hover:no-underline text-accent hover:text-cyan-950 cursor-pointer" [routerLink]="'/privacy-policy'">
            Privacy Policy
          </a>
        </div>
      </footer>
    </div>
  `,
  styles: [ `` ]
})
export default class LoginComponent {
  store: Store<AppState> = inject(Store);
  fb = inject(FormBuilder);
  document = inject(DOCUMENT);

  error = this.store.selectSignal(getAuthError);
  token = this.store.selectSignal(getAccessToken);
  isLoading = this.store.select(getAuthLoading);

  profileImages = this.store.selectSignal(getDomainImages);

  loginFormGroup = this.fb.group({
    usernameOrEmail: [ "", Validators.required ],
    password: [ "", Validators.required ]
  });

  showPassword = false;
  currentYear = new Date().getFullYear();

  get f() {
    return this.loginFormGroup.controls;
  }

  login() {
    const payload = this.loginFormGroup.getRawValue() as LoginPayload;
    this.store.dispatch(AuthActions.login(payload));
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
