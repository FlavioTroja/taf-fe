import { AfterViewInit, Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatSelectModule } from "@angular/material/select";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { Address, AutocompleteAddress } from "../../models/Address";
import { Subject, takeUntil } from "rxjs";
import { debounceTime } from "rxjs/operators";
import * as CustomersActions from "../../pages/customers/store/actions/customers.actions";
import { Store } from "@ngrx/store";
import { AppState } from "../../app.config";
import { AddressesService } from "../../services/addresses.service";

@Component({
  selector: 'app-address-autocomplete',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSelectModule, MatAutocompleteModule, MatInputModule, ReactiveFormsModule],
  template: `
    <div class="accent selected-image rounded p-2.5 !max-w-[47.5rem]">
      <div class="flex flex-row">
        <mat-icon class="material-symbols-rounded">distance</mat-icon>
        <div>LASCIA FARE A NOI</div>
      </div>
      <div class="flex text-sm black justify-left px-3 py-0 font-medium">Utilizza Google Maps per compilare i campi. Usa la barra di ricerca per cercare il tuo indirizzo, al resto pensiamo noi.</div>
      <input type="text"
             class="focus:outline-none p-3 rounded-md black w-full border-input"
             placeholder="Cerca per indirizzo completo"
             matInput
             (focusin)="showOptions=true"
             (focusout)="showOptions=false"
             [formControl]="formControl"
             [matAutocomplete]="autoAddr">
      <mat-autocomplete #autoAddr="matAutocomplete" [displayWith]="displayFn" (optionSelected)="selectAddress($event.option.value)">
        <mat-option *ngFor="let address of currentReturnedAddresses" [value]="address">
          {{ address.text }}
        </mat-option>
        <mat-option *ngIf="!currentReturnedAddresses.length" [disabled]="true">
          <div>Digita qualcosa</div>
        </mat-option>
      </mat-autocomplete>
    </div>
  `,
  styles: [``]
})
export class AddressAutocompleteComponent implements AfterViewInit {
  @Output() updateAddressForm = new EventEmitter();
  subject = new Subject();
  store: Store<AppState> = inject(Store);
  addressService = inject(AddressesService)

  currentReturnedAddresses: AutocompleteAddress[] = [];
  addressSelected: boolean = false;
  showOptions: boolean = false;

  formControl: FormControl = new FormControl<Address | any>("", {
    validators: [ Validators.required ],
  });

  ngAfterViewInit(): void {
    this.formControl.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.subject),
    ).subscribe(form => {
      this.addressSelected = (form instanceof String);
      if (!this.addressSelected && form.length > 2) {
        this.addressService.getAddressesAutocomplete({ searchAddress: form }).pipe(
          takeUntil(this.subject)
        ).subscribe((addresses) => {
          this.currentReturnedAddresses = addresses;
        });
      }
    });
  }

  displayFn(address: AutocompleteAddress): string {
    return address && address.text ? address.text : "";
  }

  selectAddress(event: any) {
    this.addressSelected = !this.addressSelected;
    this.store.dispatch(CustomersActions.getPlaceDetail({ placeId: event.placeId }))
    this.updateAddressForm.emit();
  }
}
