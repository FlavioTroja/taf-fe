import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputComponent } from "../../../../../../components/input/input.component";
import { MatSelectModule } from "@angular/material/select";
import { AddressOnCustomerSection } from "../../../../../../models/Customer";
import { MatDialogModule } from "@angular/material/dialog";
import { debounceTime } from "rxjs/operators";
import { Subject, takeUntil } from "rxjs";
import { generateRandomCode } from "../../../../../../../utils/utils";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../../../app.config";
import * as CustomersActions from "../../../../store/actions/customers.actions";
import {
  AddressAutocompleteComponent
} from "../../../../../../components/address-autocomplete/address-autocomplete.component";
import { getCustomerAddressFormActiveChanges } from "../../../../store/selectors/customers.selectors";

@Component({
  selector: 'app-customer-address-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, MatSelectModule, MatDialogModule, AddressAutocompleteComponent],
  template: `
    <div class="flex flex-col gap-2.5">
      <app-address-autocomplete (updateAddressForm)="updateAddressForm()"/>
      <div class="font-bold">O INSERISCI MANUALMENTE</div>
      <div [formGroup]="addressFormGroup">
        <div class="flex flex-col gap-2">
          <app-input [formControl]="f.country" formControlName="country" label="stato" id="customer-country" type="text" autofocus/>

          <app-input [formControl]="f.state" formControlName="state" label="regione" id="customer-state" type="text" />

          <app-input [formControl]="f.province" formControlName="province" label="provincia" id="customer-province" type="text" />

          <div class="flex gap-2">
            <div class="basis-3/4">
              <app-input [formControl]="f.city" formControlName="city" label="città" id="customer-city" type="text" />
            </div>
            <div class="basis-1/4">
              <app-input [formControl]="f.zipCode" formControlName="zipCode" label="CAP" id="customer-address-zipCode" type="number" />
            </div>
          </div>

          <div class="flex gap-2">
            <div class="basis-3/4">
              <app-input [formControl]="f.address" formControlName="address" label="indirizzo" id="customer-address" type="text" />
            </div>
            <div class="basis-1/4">
              <app-input [formControl]="f.number" formControlName="number" label="civico" id="customer-address-number" type="text" />
            </div>
          </div>

          <div class="flex flex-col basis-full mb-2">
            <label for="customer-address-note" class="text-md justify-left block px-3 py-0 font-medium"
                   [ngClass]="f.note.invalid && f.note.dirty ? ('text-red-800') : ('text-gray-900')">
              note
            </label>
            <textarea class="focus:outline-none p-3 rounded-md w-full border-input"
                      [ngClass]="{'border-input-error' : f.note.invalid && f.note.dirty}"
                      id="customer-address-note"
                      formControlName="note"></textarea>

            <div *ngIf="f.note.invalid && f.note.dirty" class="px-3 py-1 text-xs text-red-800">
              Il campo 'note' supera i 500 caratteri.
            </div>
          </div>

          <div class="flex items-center" *ngIf="showCheckbox">
            <input type="checkbox" formControlName="billing" class="w-5 h-5 mr-1">
            <label for="billing">indirizzo di fatturazione</label>
          </div>
          <div class="flex items-center" *ngIf="showCheckbox">
            <input type="checkbox" formControlName="defaultShipping" class="w-5 h-5 mr-1">
            <label for="defaultShipping">indirizzo predefinito</label>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CustomerAddressModalComponent implements OnInit, OnDestroy {

  @Input() currentAddress: Partial<AddressOnCustomerSection> = {};
  @Input() showCheckbox: boolean = true

  store: Store<AppState> = inject(Store);
  fb = inject(FormBuilder);
  subject = new Subject();

  addressChanges$ = this.store.select(getCustomerAddressFormActiveChanges)
    .pipe(takeUntil(this.subject));
  updateAddress: boolean = false

  addressFormGroup =  this.fb.group({
    id: [-1],
    code: [generateRandomCode()],
    country: ["", [Validators.required, Validators.maxLength(50)]],
    state: ["", [Validators.required, Validators.maxLength(50)]],
    province: ["", [Validators.required, Validators.maxLength(2)]],
    city: ["", [Validators.required, Validators.maxLength(50)]],
    zipCode: ["", [Validators.required, Validators.min(1), Validators.minLength(5), Validators.maxLength(5)]],
    address: ["", [Validators.required, Validators.maxLength(150)]],
    number: ["", [Validators.required, Validators.min(1)]],
    note: ["", [Validators.maxLength(500)]],
    billing: [false],
    defaultShipping: [false],
    toBeDisconnected: [false]
   });

  get f() {
    return this.addressFormGroup.controls;
  }


  ngOnInit() {
    this.addressChanges$.subscribe(addressChanges => {
      if (this.updateAddress) {
        this.addressFormGroup.patchValue({ ...addressChanges });
        this.store.dispatch(CustomersActions.clearAddressFormActiveChanges());
        this.updateAddress = false;
      }
    });
    if(this.currentAddress) {
      this.addressFormGroup.patchValue(this.currentAddress);
    }

    this.addressFormGroup.valueChanges.pipe(
      debounceTime(200),
      takeUntil(this.subject),
    ).subscribe(form => {
      if(!form || this.addressFormGroup.invalid) {
        this.store.dispatch(CustomersActions.clearAddressFormActiveChanges());
        return;
      }

      this.store.dispatch(CustomersActions.addressFormActiveChanges({ changes: form as AddressOnCustomerSection }));
    });
  }

  updateAddressForm(): void {
    this.updateAddress = true;
  }

  ngOnDestroy() {
    this.addressFormGroup.reset();
  }
}
