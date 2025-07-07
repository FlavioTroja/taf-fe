import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { Store } from "@ngrx/store";
import { AppState } from "../../../app.config";
import { InputComponent } from "../../../components/input/input.component";
import * as AuthActions from "../../../core/auth/store/auth.actions";
import { ConfirmPayload } from "../../../models/Auth";

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [ CommonModule, FormsModule, InputComponent, ReactiveFormsModule, MatIconModule ],
  template: `
    <div class="m-auto max-w-[20em] min-w-[10em] flex flex flex-wrap items-start justify-between md:max-w-screen-xl">
      <img src="/../assets/images/logo.png" class="h-14" alt="Logo"/>
    </div>

    <div class="m-auto max-w-[30em] min-w-[10em] flex flex-col gap-4 py-28 items-center">
      <div class="text-3xl font-extrabold text-center text-done">Registrazione completata!</div>
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
        <button type="submit" [disabled]="confirmFormGroup.invalid"
                [ngClass]="{ 'opacity-50': confirmFormGroup.invalid }"
                class="flex items-center rounded-full icon-accent px-12 py-3 font-extrabold text-white shadow-md hover:bg-cyan-950">
          Conferma
        </button>
      </form>
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

  confirmFormGroup = this.fb.group({
    email: [ '', [ Validators.required, Validators.email ] ],
    confirmationCode: [ "", Validators.required ],
  })

  confirm() {

    const payload = this.confirmFormGroup.getRawValue() as ConfirmPayload;
    this.store.dispatch(AuthActions.confirm({ payload }));

  }
}
