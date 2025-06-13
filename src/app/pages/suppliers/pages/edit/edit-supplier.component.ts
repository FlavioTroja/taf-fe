import { Component, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputComponent } from "../../../../components/input/input.component";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { getRouterData, selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import * as SupplierActions from "../../store/actions/suppliers.actions";
import { createSupplierPayload, PartialSupplier } from "../../../../models/Supplier";
import { getCurrentSupplier } from "../../store/selectors/suppliers.selectors";
import { difference } from "../../../../../utils/utils";
import { map, pairwise, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import {MatIconModule} from "@angular/material/icon";
import { getPhoneNumberRegExp } from 'src/utils/regex';

@Component({
  selector: 'app-supplier-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, MatIconModule],
  template: `
    <ng-container>
        <div class="text-1xl font-extrabold uppercase">Informazioni generali</div>
        <form [formGroup]="supplierForm">
          <div class="flex flex-row gap-2">
            <div class="flex flex-col basis-1/2">
              <app-input [formControl]="f.name" formControlName="name" label="nome" id="supplier-name" type="text" />
            </div>

            <div class="flex flex-col basis-1/2">
              <app-input [formControl]="f.iban" formControlName="iban" label="IBAN" id="supplier-iban" type="text" />
            </div>
          </div>

          <div class="flex flex-row gap-2">
            <div class="flex flex-col basis-1/2">
              <div class="flex gap-2 items-end">
                <div class="grow">
                  <app-input [formControl]="f.email" formControlName="email" label="email" id="supplier-email" type="email" />
                </div>
                <a [href]="'mailto:' + f.email.getRawValue()" *ngIf="viewOnly()" class="flex h-12 border-input items-center px-3 py-0.5 rounded-md shadow-sm accent text-sm font-medium">
                  <mat-icon class="icon-size material-symbols-rounded">mail</mat-icon>
                </a>
              </div>
            </div>

            <div class="flex flex-col basis-1/2">
              <div class="flex gap-2 items-end">
                <div class="grow">
                  <app-input [formControl]="f.phone" formControlName="phone" label="telefono" id="supplier-phone" type="text" />
                </div>
                <a [href]="'https://wa.me/' + f.phone.getRawValue()" target="_blank" *ngIf="viewOnly()" class="flex h-12 border-input items-center px-3 py-0.5 rounded-md shadow-sm accent text-sm font-medium">
                  <mat-icon class="icon-size material-symbols-rounded">phone</mat-icon>
                </a>
              </div>
            </div>
          </div>


          <div class="text-1xl font-extrabold uppercase pt-4">Indirizzo</div>
          <ng-container formGroupName="address">
            <div class="grid gap-3">
              <div class="grid gap-2">
                <div class="flex flex-row gap-2">
                  <div class="flex flex-col basis-1/3">
                    <app-input [formControl]="address.country" formControlName="country" label="stato" id="supplier-country" type="text" />
                  </div>
                  <div class="flex flex-col basis-1/3">
                    <app-input [formControl]="address.state" formControlName="state" label="regione" id="supplier-state" type="text" />
                  </div>
                  <div class="flex flex-col basis-1/3">
                    <app-input [formControl]="address.province" formControlName="province" label="provincia" id="customer-province" type="text" />
                  </div>
                </div>

                <div class="flex flex-row gap-2">
                  <div class="flex flex-row basis-1/2 gap-2">
                    <div class="basis-3/4">
                      <app-input [formControl]="address.city" formControlName="city" label="città" id="customer-city" type="text" />
                    </div>
                    <div class="basis-1/4">
                      <app-input [formControl]="address.zipCode" formControlName="zipCode" label="CAP" id="customer-address-zipCode" type="number" />
                    </div>
                  </div>
                  <div class="flex flex-row basis-1/2 gap-2">
                    <div class="basis-3/4">
                      <app-input [formControl]="address.address"
                                 [ngClass]="{'border-input-error' : address.address.invalid && address.address.dirty}"
                                 formControlName="address"
                                 label="indirizzo"
                                 id="customer-address"
                                 type="text" />
                    </div>
                    <div class="basis-1/4">
                      <app-input [formControl]="address.number" formControlName="number" label="civico" id="customer-address-number" type="text" />
                    </div>
                  </div>
                </div>

                <div class="flex flex-col basis-full mb-2">
                  <label for="customer-address-note" class="text-md justify-left block px-3 py-0 font-medium">note</label>
                  <textarea class="focus:outline-none p-3 rounded-md w-full border-input"
                            [ngClass]="{'border-input-error' : address.note.invalid && address.note.dirty}"
                            id="customer-address-note"
                            formControlName="note"></textarea>

                  <div *ngIf="address.note.invalid && address.note.dirty" class="px-3 py-1 text-xs text-red-800">
                    Il campo 'note' non deve superare i {{maxNoteCharLength}} caratteri
                  </div>
                </div>
              </div>
            </div>
          </ng-container>

        </form>
    </ng-container>
  `,
  styles: []
})
export default class EditSupplierComponent implements OnInit, OnDestroy  {
  //need to stay due to textarea being used, it doesn't handle the custom errors
  private readonly maxNoteCharacters = 512;

  store: Store<AppState> = inject(Store);
  subject = new Subject();

  fb = inject(FormBuilder);

  active$ = this.store.select(getCurrentSupplier)
    .pipe(takeUntilDestroyed());

  id = toSignal(this.store.select(selectCustomRouteParam("id")));
  viewOnly: Signal<boolean> = toSignal(this.store.select(getRouterData).pipe(
    map(data => data!["viewOnly"] ?? false)
  ));

  supplierForm = this.fb.group({
    name: [{ value: "", disabled: this.viewOnly() }, Validators.required],
    email: [{ value: "", disabled: this.viewOnly() }, Validators.email],
    iban: [{ value: "", disabled: this.viewOnly() }],
    phone: [{ value: "", disabled: this.viewOnly() }, Validators.pattern(getPhoneNumberRegExp())],
    address: this.fb.group({
      country: ["", [Validators.required, Validators.maxLength(256)]],
      state: ["", [Validators.required, Validators.maxLength(256)]],
      province: ["", [Validators.required, Validators.maxLength(256)]],
      city: ["", [Validators.required, Validators.maxLength(256)]],
      zipCode: ["", [Validators.required, Validators.maxLength(256)]],
      address: ["", [Validators.required, Validators.maxLength(256)]],
      number: ["", [Validators.required, Validators.maxLength(256)]],
      note: ["", Validators.maxLength(this.maxNoteCharacters)],
    }),
  });

  initFormValue: PartialSupplier = {};

  get f() {
    return this.supplierForm.controls;
  }

  get address() {
    return this.supplierForm.controls["address"].controls;
  }

  get isNewSupplier() {
    return this.id() === "new";
  }

  get maxNoteCharLength() {
    return this.maxNoteCharacters;
  }

  ngOnInit() {

    if (!this.isNewSupplier) {
        this.store.dispatch(
          SupplierActions.getSupplier({ id: this.id(), params: { populate: "address" } })
        );
    }

    this.active$
      .subscribe((value: PartialSupplier | any) => {
        if(!value) {
          return;
        }

        this.supplierForm.patchValue(value);

        this.initFormValue = this.supplierForm.value as PartialSupplier;
      });

    this.editSupplierChanges();
  }

  editSupplierChanges() {
    this.supplierForm.valueChanges.pipe(
      pairwise(),
      map(([_, newState]) => {
        if(!Object.values(this.initFormValue).length && !this.isNewSupplier) {
          return {};
        }

        const diff = {
          ...difference(this.initFormValue, newState),

          address: newState.address
        };

        return createSupplierPayload(diff);
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.supplierForm.invalid ? { ...changes, id: +this.id() } : {}),
      takeUntil(this.subject),
    ).subscribe((changes: any) => this.store.dispatch(SupplierActions.supplierActiveChanges({ changes })));
  }

  ngOnDestroy(): void {
      this.supplierForm.reset();

      this.store.dispatch(SupplierActions.clearSupplierActive());
      this.store.dispatch(SupplierActions.clearSupplierHttpError());
  }
}
