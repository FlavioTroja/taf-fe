import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import { Store } from "@ngrx/store";
import { AppState } from "../../../app.config";
import { InputComponent } from "../../../components/input/input.component";
import * as AuthActions from "../../../core/auth/store/auth.actions";
import { getAccessToken, getAuthError } from "../../../core/auth/store/auth.selectors";
import { RegisterPayload } from "../../../models/Auth";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ CommonModule, FormsModule, MatIconModule, ReactiveFormsModule, InputComponent, RouterLink ],
  template: `
    <div class="m-auto max-w-[20em] min-w-[10em] flex flex flex-wrap items-start justify-between md:max-w-screen-xl">
      <img src="/../assets/images/logo.png" class="h-14" alt="Logo"/>
    </div>

    <div class="m-auto max-w-[20em] min-w-[10em] flex flex-col gap-4 py-28 items-center">
      <div class="text-3xl font-extrabold">Accedi</div>
      <form class="contents" [formGroup]="registerFormGroup" (ngSubmit)="register()">
        <div class="w-full">
          <app-input [formControl]="f.name" formControlName="name" label="Nome"
                     id="name" type="text"/>
        </div>

        <div class="w-full">
          <app-input [formControl]="f.surname" formControlName="surname" label="Cognome"
                     id="surname" type="text"/>
        </div>

        <div class="w-full">
          <app-input [formControl]="f.email" formControlName="email" label="E-mail"
                     id="email" type="text"/>
        </div>

        <div class="w-full">
          <label for="password" class="text-md justify-left block px-3 py-0 font-medium"
                 [ngClass]="f.password.invalid && f.password.dirty ? ('text-red-800') : ('text-gray-900')">password</label>

          <div class="relative">
            <input [type]="showPassword ? 'text' : 'password'" id="password"
                   class="focus:outline-none p-3 rounded-md pr-12 w-full"
                   [ngClass]="f.password.invalid && f.password.dirty ? ('border-input-error') : ('border-input')"
                   formControlName="password">
            <button (click)="togglePassword()" type="button"
                    class="absolute end-1 rounded-lg text-sm px-4 py-3 items-center">
              <mat-icon class="material-symbols-rounded">visibility{{ showPassword ? '_off' : '' }}</mat-icon>
            </button>
          </div>

          <div *ngIf="f.password.invalid && f.password.dirty" class="px-3 py-1 text-xs text-red-800">
            Il campo 'password' è obbligatorio.
          </div>
        </div>

        <div class="w-full">
          <label for="confirmPassword" class="text-md justify-left block px-3 py-0 font-medium"
                 [ngClass]="f.confirmPassword.invalid && f.confirmPassword.dirty ? ('text-red-800') : ('text-gray-900')">Conferma
            Password</label>

          <div class="relative">
            <input [type]="showConfirmPassword ? 'text' : 'password'" id="confirmPassword"
                   class="focus:outline-none p-3 rounded-md pr-12 w-full"
                   [ngClass]="f.confirmPassword.invalid && f.confirmPassword.dirty ? ('border-input-error') : ('border-input')"
                   formControlName="confirmPassword">
            <button (click)="toggleConfirmPassword()" type="button"
                    class="absolute end-1 rounded-lg text-sm px-4 py-3 items-center">
              <mat-icon class="material-symbols-rounded">visibility{{ showConfirmPassword ? '_off' : '' }}</mat-icon>
            </button>
          </div>

          <div *ngIf="f.confirmPassword.invalid && f.confirmPassword.dirty" class="px-3 py-1 text-xs text-red-800">
            Il campo 'Conferma Password' è obbligatorio.
          </div>
        </div>

        <div *ngIf="!!error()" class="flex w-full rounded-lg bg-red-200 p-2 text-sm text-red-800" role="alert">
          <div class="flex flex-row gap-2 items-center">
            <mat-icon class="material-symbols-rounded-filled">
              warning
            </mat-icon>
            <span class="sr-only">Info</span>
            <p class="break-words">{{ error()?.reason?.message }}</p>
          </div>
        </div>

        <div class="flex w-full rounded-lg bg-red-200 p-2 text-sm text-red-800" role="alert"
             *ngIf="registerFormGroup.hasError('passwordMismatch')
              && registerFormGroup.get('confirmPassword')?.touched">
          <div class="flex flex-row gap-2 items-center">
            <mat-icon class="material-symbols-rounded-filled">
              warning
            </mat-icon>
            <span class="sr-only">Info</span>
            <p class="break-words">Le password non corrispondono.</p>
          </div>
        </div>

        <button type="submit" [disabled]="registerFormGroup.invalid"
                [ngClass]="{ 'opacity-50': registerFormGroup.invalid }"
                class="flex items-center rounded-full icon-accent px-12 py-3 font-extrabold text-white shadow-md hover:bg-cyan-950">
          Registrati
          <mat-icon *ngIf="!isLoaded()"
                    class="icon-size material-symbols-rounded-filled cursor-pointer animate-spin duration-700 ease-in-out">
            progress_activity
          </mat-icon>
        </button>

      </form>

      <div>Sei già registrato? <span class="underline text-accent hover:text-cyan-950 cursor-pointer"
                                     [routerLink]="'/auth/login'">Login</span>
      </div>
    </div>
  `,
  styles: [ `` ]
})
export default class RegisterComponent {

  store: Store<AppState> = inject(Store);
  fb = inject(FormBuilder);

  error = this.store.selectSignal(getAuthError);
  token = this.store.selectSignal(getAccessToken);

  loading = signal(!!this.error() || !!this.token());
  isLoaded = computed(() => {
    return (!this.loading());
  });

  registerFormGroup = this.fb.group({
    name: [ "", Validators.required ],
    surname: [ "", Validators.required ],
    email: [ "", [ Validators.required, Validators.email ] ],
    password: [ "", Validators.required ],
    confirmPassword: [ "", Validators.required ]
  }, { validators: passwordMatchValidator });

  showPassword = false;
  showConfirmPassword = false;

  get f() {
    return this.registerFormGroup.controls;
  }

  register() {
    // this.loading.set(true);

    const payload = this.registerFormGroup.getRawValue() as RegisterPayload;
    console.log(payload)
    this.store.dispatch(AuthActions.register({ payload }));

  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm
    ? { passwordMismatch: true }
    : null;
};
