import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from "@ngrx/store";
import { getAccessToken, getAuthError } from "../../../core/auth/store/auth.selectors";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { AppState } from "../../../app.config";
import { MatIconModule } from "@angular/material/icon";

import * as AuthActions from "../../../core/auth/store/auth.actions";
import { LoginPayload } from "../../../models/Auth";
import { InputComponent } from "../../../components/input/input.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, ReactiveFormsModule, InputComponent],
  template: `
    <div class="m-auto max-w-[20em] min-w-[10em] flex flex flex-wrap items-start justify-between md:max-w-screen-xl">
      <img src="/../assets/images/logo.png" class="h-14" alt="Logo" />
    </div>

    <div class="m-auto max-w-[20em] min-w-[10em] flex flex-col gap-4 py-28 items-center">
      <div class="text-3xl font-extrabold">Accedi</div>
      <form class="contents" [formGroup]="loginFormGroup" (ngSubmit)="login()">
        <div class="w-full">
          <app-input [formControl]="f.usernameOrEmail" formControlName="usernameOrEmail" label="e-mail o nome utente" id="usernameOrEmail" type="text" />
        </div>

        <div class="w-full">
          <label for="password" class="text-md justify-left block px-3 py-0 font-medium"
                 [ngClass]="f.password.invalid && f.password.dirty ? ('text-red-800') : ('text-gray-900')">password</label>

          <div class="relative">
              <input [type]="showPassword ? 'text' : 'password'" id="password" class="focus:outline-none p-3 rounded-md pr-12 w-full" [ngClass]="f.password.invalid && f.password.dirty ? ('border-input-error') : ('border-input')" formControlName="password">
              <button (click)="togglePassword()" type="button" class="absolute end-1 rounded-lg text-sm px-4 py-3 items-center">
                <mat-icon class="material-symbols-rounded">visibility{{showPassword ? '_off' : ''}}</mat-icon>
              </button>
          </div>

          <div *ngIf="f.password.invalid && f.password.dirty" class="px-3 py-1 text-xs text-red-800">
            Il campo 'password' è obbligatorio.
          </div>
        </div>

        <div *ngIf="!!error()" class="flex w-full rounded-lg bg-red-200 p-2 text-sm text-red-800" role="alert">
          <div class="flex flex-row gap-2 items-center">
            <mat-icon class="material-symbols-rounded-filled">
              warning
            </mat-icon>
            <span class="sr-only">Info</span>
            <p class="break-words">{{error()?.reason?.message}}</p>
          </div>
        </div>

        <button type="submit" [disabled]="loginFormGroup.invalid" [ngClass]="{ 'opacity-50': loginFormGroup.invalid }" class="flex items-center rounded-full icon-accent px-12 py-3 font-extrabold text-white shadow-md hover:bg-cyan-950">
            Entra <mat-icon *ngIf="!isLoaded()" class="icon-size material-symbols-rounded-filled cursor-pointer animate-spin duration-700 ease-in-out">progress_activity</mat-icon>
        </button>

      </form>
    </div>
  `,
  styles: [``]
})
export default class LoginComponent {

  store: Store<AppState> = inject(Store);
  fb = inject(FormBuilder);

  error = this.store.selectSignal(getAuthError);
  token = this.store.selectSignal(getAccessToken);

  loading = signal(!!this.error() || !!this.token());
  isLoaded = computed(() => {
    return (!this.loading());
  });

  loginFormGroup = this.fb.group({
      usernameOrEmail: ["", Validators.required],
      password: ["", Validators.required]
  });

  showPassword = false;

  get f() { return this.loginFormGroup.controls; }

  login () {
    // this.loading.set(true);

    const payload = this.loginFormGroup.getRawValue() as LoginPayload;
    this.store.dispatch(AuthActions.login(payload));

  }


  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
