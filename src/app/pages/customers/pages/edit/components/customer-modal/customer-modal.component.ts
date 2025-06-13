import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputComponent } from "../../../../../../components/input/input.component";
import { MatSelectModule } from "@angular/material/select";
import {
  Customer,
  CustomerType,
  customerTypeArray,
} from "../../../../../../models/Customer";
import { MatDialogModule } from "@angular/material/dialog";
import { debounceTime } from "rxjs/operators";
import { Subject, takeUntil } from "rxjs";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../../../app.config";
import * as CustomersActions from "../../../../store/actions/customers.actions";
import { getNewCustomerFormActiveChanges } from "../../../../store/selectors/customers.selectors";
import { getFiscalCodeRegex, getPhoneNumberRegExp } from "../../../../../../../utils/regex";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-customer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, MatSelectModule, MatDialogModule, MatIconModule],
  template: `
    <div [formGroup]="customerFormGroup" class="mb-2">
      <div class="flex flex-col gap-2">
        <div class="flex flex-row gap-2">
          <div class="flex flex-col basis-1/2">
            <app-input [formControl]="f.name" formControlName="name" label="nome" id="customer-name" type="text" />
          </div>

          <div class="flex flex-col basis-1/2">
            <app-input [formControl]="f.fiscalCode" [customValidator]="true" formControlName="fiscalCode" label="codice fiscale" id="fiscalCode" type="text" />
            <div class="text-sm text-red-700" *ngIf="customerFormGroup.get('fiscalCode')?.invalid">
              Codice fiscale non valido
            </div>
          </div>
        </div>

        <div class="flex flex-row gap-2">
          <div class="flex flex-col basis-1/2">
            <app-input [formControl]="f.email" formControlName="email" label="email" id="customer-email" type="email" />
          </div>

          <div class="flex flex-col basis-1/2">
            <app-input [formControl]="f.phone" formControlName="phone" label="telefono" id="customer-phone" type="text" />
          </div>
        </div>

        <div class="text-1xl font-extrabold uppercase">Informazioni finanziarie</div>

        <div class="flex flex-row gap-2">
          <div class="flex flex-col basis-1/2">
            <app-input [formControl]="f.pec" formControlName="pec" label="pec" id="pec" type="email" />
          </div>
          <div class="flex flex-col basis-1/2">
            <app-input [formControl]="f.vatNumber" formControlName="vatNumber" label="partita iva" id="vatNumber" type="text" />
          </div>
        </div>

        <div class="flex flex-row gap-2">

          <div class="basis-1/2">
            <app-input [formControl]="f.sdiNumber" formControlName="sdiNumber" label="SDI" id="sdi" type="text" />
          </div>

          <div class="flex flex-col basis-1/2">
            <label class="text-md justify-left block px-3 py-0 font-medium">tipologia cliente</label>
            <mat-select class="focus:outline-none p-3 border-input rounded-md w-full bg-foreground"
              [formControl]="f.type"
            >
              <mat-option class="p-3 bg-white !italic">Nessun valore</mat-option>
              <mat-option class="p-3 bg-white" *ngFor="let type of customerTypeArray" [value]="type.value">{{type.name}}</mat-option>
            </mat-select>
          </div>

        </div>

        <div class="flex flex-row gap-2">
          <div class="flex flex-col basis-full">
            <label for="customer-note" class="text-md justify-left block px-3 py-0 font-medium"
                   [ngClass]="f.note.invalid && f.note.dirty ? ('text-red-800') : ('text-gray-900')">
              note
            </label>
            <textarea class="focus:outline-none p-3 rounded-md w-full border-input"
                      [ngClass]="{'border-input-error' : f.note.invalid && f.note.dirty}"
                      id="customer-note"
                      formControlName="note"></textarea>

            <div *ngIf="f.note.invalid && f.note.dirty" class="px-3 py-1 text-xs text-red-800">
              Il campo 'note' non deve superare i {{maxNoteCharLength}} caratteri
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: []
})
export class CustomerModalComponent implements OnInit, OnDestroy {
  protected readonly customerTypeArray = customerTypeArray;
  private readonly maxNoteCharacters = 512;

  store: Store<AppState> = inject(Store);
  fb = inject(FormBuilder);
  subject = new Subject();

  customerChanges$ = this.store.select(getNewCustomerFormActiveChanges)
    .pipe(takeUntil(this.subject));

  customerFormGroup =  this.fb.group({
    id: [-1],
    name: ["", [Validators.required, Validators.maxLength(256)]],
    fiscalCode: ["", Validators.pattern(getFiscalCodeRegex()), !Validators.required],
    vatNumber: ["", Validators.maxLength(256)],
    sdiNumber: ["", Validators.maxLength(256)],
    type: [CustomerType.PRIVATO, [Validators.required]],
    email: ["", [Validators.required, Validators.email]],
    pec: ["", Validators.maxLength(256)],
    phone: ["", Validators.pattern(getPhoneNumberRegExp())],
    note: ["", Validators.maxLength(this.maxNoteCharacters)],
   });

  get f() {
    return this.customerFormGroup.controls;
  }

  get maxNoteCharLength(){
    return this.maxNoteCharacters;
  }


  ngOnInit() {
    this.store.dispatch(CustomersActions.newClearCustomerFormActiveChanges());

    this.customerFormGroup.valueChanges.pipe(
      debounceTime(200),
      takeUntil(this.subject),
    ).subscribe(form => {
      if(this.customerFormGroup.invalid) {
        this.store.dispatch(CustomersActions.newClearCustomerFormActiveChanges());
        return;
      }

      this.store.dispatch(CustomersActions.newCustomerFormActiveChanges({ changes: form as Partial<Customer> }));
    });
  }

  ngOnDestroy() {
    this.customerFormGroup.reset();
  }

}
