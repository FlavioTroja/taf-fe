import { Component, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import {  CommonModule } from '@angular/common';
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { getRouterData, selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import {
  AddressOnCustomerSection,
  createCustomerPayload,
  CustomerType,
  customerTypeArray,
  PartialCustomer
} from "../../../../models/Customer";
import { getCurrentCustomer } from "../../store/selectors/customers.selectors";
import *  as CustomerActions from "../../../customers/store/actions/customers.actions";
import { map, pairwise, takeUntil } from "rxjs/operators";
import { InputComponent } from "../../../../components/input/input.component";
import { MatIconModule } from "@angular/material/icon";
import { difference, generateRandomCode } from "../../../../../utils/utils";
import { Subject } from "rxjs";
import { MatSelectModule } from "@angular/material/select";
import { CustomerAddressesSectionComponent } from "./components/customer-addresses-sections/customer-addresses-section.component";
import { getFiscalCodeRegex, getPhoneNumberRegExp } from "../../../../../utils/regex";


@Component({
  selector: 'app-edit-customer',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, InputComponent, MatIconModule, MatSelectModule, CustomerAddressesSectionComponent ],
  templateUrl: "edit-customer.component.html",
  styles: [``]
})
export default class EditCustomerComponent implements OnInit, OnDestroy {
  //need to stay due to textarea being used, it doesn't handle the custom errors
  private readonly maxNoteCharacters = 512;

  store: Store<AppState> = inject(Store);
  subject = new Subject();

  fb = inject(FormBuilder);

  active$ = this.store.select(getCurrentCustomer)
    .pipe(takeUntilDestroyed());

  id = toSignal(this.store.select(selectCustomRouteParam("id")));
  viewOnly: Signal<boolean> = toSignal(this.store.select(getRouterData).pipe(
    map(data => data!["viewOnly"] ?? false)
  ));

  customerForm = this.fb.group({
    name: [{ value: "", disabled: this.viewOnly() }, [Validators.required, Validators.maxLength(256)]],
    fiscalCode: [{ value: "", disabled: this.viewOnly() }, Validators.pattern(getFiscalCodeRegex()), !Validators.required],
    vatNumber: [{ value: "", disabled: this.viewOnly() }, Validators.maxLength(256)],
    sdiNumber: [{ value: "", disabled: this.viewOnly() }, Validators.maxLength(256)],
    type: [{ value: CustomerType.PRIVATO, disabled: this.viewOnly() }, [Validators.required]],
    email: [{ value: "", disabled: this.viewOnly() }, [Validators.required, Validators.email]],
    pec: [{ value: "", disabled: this.viewOnly() }, Validators.maxLength(256)],
    phone: [{ value: "", disabled: this.viewOnly() }, Validators.pattern(getPhoneNumberRegExp())],
    note: [{ value: "", disabled: this.viewOnly() }, Validators.maxLength(this.maxNoteCharacters)],
    addresses: [[{}]],
  });

  initFormValue: PartialCustomer = {};
  deletedAddresses: AddressOnCustomerSection[] = [];

  get f() {
    return this.customerForm.controls;
  }

  get addresses() {
    return this.f.addresses.value?.filter(o => Object.keys(o).length > 0) as AddressOnCustomerSection[];
  }

  get isNewCustomer() {
    return this.id() === "new";
  }

  get maxNoteCharLength(){
    return this.maxNoteCharacters;
  }

  ngOnInit() {
    if (!this.isNewCustomer) {
      this.store.dispatch(
        CustomerActions.getCustomer({ id: this.id() })
      );
    }

    this.active$
      .subscribe((value: PartialCustomer | any) => {
        if(!value) {
          return;
        }

        this.customerForm.patchValue(value);

        this.loadAddresses(value.addresses);

        this.initFormValue = this.customerForm.value as PartialCustomer;
      });

    this.editCustomerChanges();

  }

  loadAddresses(addresses: AddressOnCustomerSection[]) {
    this.customerForm.patchValue({
      addresses: addresses.map(p => ({
        ...p,
        code: generateRandomCode()
      }))
    });
  }

  editCustomerChanges() {
    this.customerForm.valueChanges.pipe(
      pairwise(),
      map(([_, newState]) => {
        if(!Object.values(this.initFormValue).length && !this.isNewCustomer) {
          return {};
        }
        const diff = {
          ...difference(this.initFormValue, newState),

          // Array data
          addresses: [
            ...(newState.addresses || []),
            ...this.deletedAddresses
          ]
        };

        return createCustomerPayload(diff);
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.customerForm.invalid ? { ...changes, id: +this.id() } : {}),
      takeUntil(this.subject),
      // tap(changes => console.log(changes)),
    ).subscribe((changes: any) => this.store.dispatch(CustomerActions.customerActiveChanges({ changes })));
  }

  onAddressAdd({ newAddress }: { newAddress: Partial<AddressOnCustomerSection> }) {
    let currentAddresses = [ ...this.addresses ].map(address => ({
      ...address,
      billing: newAddress.billing ? false : address.billing,
      defaultShipping: newAddress.defaultShipping ? false : address.defaultShipping
    }));

    this.customerForm.patchValue({
      addresses: [
        ...currentAddresses,
        newAddress
      ]
    });
  }

  onRemoveAddress({ code }: { code: string }) {
    const deleted = this.addresses.find((a) => a.code === code && a.id !== -1);
    if(deleted) {
      this.deletedAddresses.push({ ...deleted, toBeDisconnected: true });
    }

    this.customerForm.patchValue({
      addresses: this.addresses.filter((a) => a.code !== code)
    });
  }

  onAddressChangeData({ data }: { data: Partial<AddressOnCustomerSection> }) {
    this.customerForm.patchValue({
      addresses: this.addresses.map((p , i) => {
        if(p.code === data.code) {
          return {
            ...p,
            address: data.address ? data.address : p.address,
            number: data.number ? data.number : p.number,
            city: data.city ? data.city : p.city,
            country: data.country ? data.country : p.country,
            note: data.note ? data.note : p.note,
            province: data.province ? data.province : p.province,
            state: data.state ? data.state : p.state,
            zipCode: data.zipCode ? data.zipCode : p.zipCode,
            billing: data.billing ? data.billing : p.billing,
            defaultShipping: data.defaultShipping ? data.defaultShipping : p.defaultShipping,
          }
        }
        return {
          ...p,
          billing: data.billing ? false : p.billing,
          defaultShipping: data.defaultShipping ? false : p.defaultShipping
        };
      })
    })
  }

  ngOnDestroy(): void {
    this.customerForm.reset();

    this.store.dispatch(CustomerActions.clearCustomerActive());
    this.store.dispatch(CustomerActions.clearCustomerHttpError());
  }

  protected readonly customerTypeArray = customerTypeArray;

}
