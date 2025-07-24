import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { Store } from "@ngrx/store";
import { AppState } from "../../../app.config";
import { InputComponent } from "../../../components/input/input.component";
import * as AuthActions from "../../../core/auth/store/auth.actions";
import { ConfirmPayload } from "../../../models/Auth";
import { selectRouteQueryParamParam } from "../../../core/router/store/router.selectors";
import { RouterLink } from "@angular/router";
import { getAuthError, getAuthLoading } from "../../../core/auth/store/auth.selectors";
import { getDomainImages } from "../../../core/profile/store/profile.selectors";

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [ CommonModule, FormsModule, InputComponent, ReactiveFormsModule, MatIconModule, RouterLink ],
  template: `
    <div class="m-auto max-w-[20em] min-w-[10em] flex flex flex-wrap items-start justify-between md:max-w-screen-xl">
      <img [src]="'https://autismfriendly.overzoom.it/media/' + profileImages()?.logo" class="h-14" alt="Logo"/>
    </div>

    <div class="m-auto max-w-[30em] min-w-[10em] flex flex-col gap-4 py-28 items-center">
      <div *ngIf="isFromRegister()" class="text-3xl font-extrabold text-center text-done">Registrazione
        completata!
      </div>
      <div class="text-lg text-center">Abbiamo inviato una mail di conferma, contenente un codice OTP.
      </div>
      <div class="text-xl font-extrabold">Inserisci il codice inviato</div>
      <form class="contents" [formGroup]="confirmFormGroup" (ngSubmit)="confirm()">
        <div class="w-full flex flex-col gap-3">
          <app-input [formControl]="f.email" formControlName="email" label="E-mail di registrazione"
                     id="email" type="text"/>
          <app-input [formControl]="f.confirmationCode" formControlName="confirmationCode" label="Codice di conferma"
                     id="confirmationCode" type="text"/>
        </div>
        <div *ngIf="!!error()" class="flex w-full rounded-lg bg-red-200 p-2 text-sm text-red-800" role="alert">
          <div class="flex flex-row gap-2 items-center">
            <mat-icon class="material-symbols-rounded-filled">
              warning
            </mat-icon>
            <span class="sr-only">Info</span>
            <p class="break-words">{{ error()?.error?.error }}</p>
          </div>
        </div>

        <button type="submit" [disabled]="confirmFormGroup.invalid"
                [ngClass]="{ 'opacity-50': confirmFormGroup.invalid }"
                class="flex items-center rounded-full gap-1 icon-accent px-12 py-3 font-extrabold text-white shadow-md hover:bg-cyan-950">
          Conferma
          <mat-icon *ngIf="!!(isLoading | async)"
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
  styles: []
})
export default class ConfirmComponent {

  store: Store<AppState> = inject(Store);
  fb = inject(FormBuilder);

  get f() {
    return this.confirmFormGroup.controls;
  }

  error = this.store.selectSignal(getAuthError)
  isLoading = this.store.select(getAuthLoading);
  queryParams = this.store.selectSignal(selectRouteQueryParamParam());
  isFromRegister = computed(() => this.queryParams()?.['isFromRegister'] === 'true');

  profileImages = this.store.selectSignal(getDomainImages);

  confirmFormGroup = this.fb.group({
    email: [ '', [ Validators.required, Validators.email ] ],
    confirmationCode: [ "", Validators.required ],
  })

  confirm() {

    const payload = this.confirmFormGroup.getRawValue() as ConfirmPayload;
    this.store.dispatch(AuthActions.confirm({ payload }));

  }
}
