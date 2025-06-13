import { Component, inject, OnDestroy, OnInit, Signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Store } from "@ngrx/store";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { debounceTime, map } from "rxjs/operators";
import { Observable, pairwise, Subject, takeUntil } from "rxjs";
import { MatIconModule } from "@angular/material/icon";
import { AppState } from "../../../../app.config";
import { getRouterData, selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import { Address } from "../../../../models/Address";
import { Customer, PartialCustomer } from "../../../../models/Customer";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { CustomersService } from "../../../customers/services/customers.service";
import { PaginateDatasource } from "../../../../models/Table";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSelectModule } from "@angular/material/select";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import { MatDialog } from "@angular/material/dialog";
import {
  CustomerAddressModalComponent
} from "../../../customers/pages/edit/components/customer-address-modal/customer-address-modal.component";
import { concatLatestFrom } from "@ngrx/effects";
import {
  getCustomerAddressFormActiveChanges,
  getNewCustomerFormActiveChanges
} from "../../../customers/store/selectors/customers.selectors";
import * as InspectionActions from "../../../inspections/store/actions/inspections.actions";
import * as CustomerActions from "../../../customers/store/actions/customers.actions";
import {
  CustomerModalComponent
} from "../../../customers/pages/edit/components/customer-modal/customer-modal.component";
import { getCurrentInspection } from "../../store/selectors/inspections.selectors";
import { createSetupPayloadFromForm, Participant, Setup, SetupForm } from "../../../../models/Setup";
import {
  createInspectionPayloadFromForm,
  Inspection,
  InspectionForm,
  InspectionStatus,
  InspectionStatusDetail
} from "../../../../models/Inspection";
import { getProfileUser } from "../../../../core/profile/store/profile.selectors";
import { Roles, User } from "../../../../models/User";
import { AttachmentsComponent } from "../../../../components/attachments/attachments.component";
import { UsersService } from "../../../users/services/users.service";
import { getAttachmentsObjectList, hasRoles } from "../../../../../utils/utils";

@Component({
  selector: 'app-inspection-edit',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatIconModule, MatNativeDateModule, ReactiveFormsModule, FormsModule, MatAutocompleteModule, MatSelectModule, CustomerAddressModalComponent, CustomerModalComponent, AttachmentsComponent],
  template: `
    <ng-container>
      <div *ngIf="!isNewSetUp && currentInspectionStatusDetail?.rejectionReason">
        <div class="black font-bold text-2xl uppercase">Notifiche e aggiornamenti</div>
        <div class="flex flex-row w-full p-2.5 gap-3.5 border rounded bg-light-gray"
             [ngClass]="currentInspectionStatusDetail?.rejectionReason ? 'border-error' : 'border-success'">
          <div class="flex items-center">
            <div class="rounded-full flex p-2.5 gap-1 "
                 [ngClass]="currentInspectionStatusDetail?.rejectionReason ? 'icon-error' : 'icon-success'">
              <mat-icon class="material-symbols-rounded-filled"
                        [ngClass]="currentInspectionStatusDetail?.rejectionReason ? 'icon-text-error' : 'icon-text-success'">
                feedback
              </mat-icon>
            </div>
          </div>
          <div class="flex flex-col justify-center">
            <div class="font-bold text-lg uppercase"
                 [ngClass]="currentInspectionStatusDetail?.rejectionReason ? 'text-error' : 'text-success'">
              {{ currentInspectionStatusDetail?.rejectionReason ? 'data rifiutata' : 'data accettata' }}
            </div>
            <!-- ngif errore.messaggio -->
            <div *ngIf="currentInspectionStatusDetail?.rejectionReason" class="flex flex-row gap-1">
              <div class="font-bold">
                {{ currentInspectionStatusDetail?.user?.username }}:
              </div>
              <div>
                {{ currentInspectionStatusDetail?.rejectionReason }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <form [formGroup]="setUpForm">
        <div class="flex flex-row gap-2">

          <div class="flex flex-col basis-1/3">
            <label class="text-md justify-left block px-3 py-1.5 font-medium">titolo</label>
            <input
              [ngStyle]="viewOnly() ? {'cursor': 'pointer'} : {}"
              type="text"
              class="focus:outline-none p-3 rounded-md w-full border-input"
              [ngClass]="{
                      'border-input-error' : setup.title.invalid && setup.title.dirty,
                      'ddt-done' : setup.title.getRawValue(),
                      'disabled': !(isUserPlanner() | async) || isCompletedSetup
                    }"
              placeholder="Allestimento X"
              matInput
              formControlName="title"
              [readonly]="viewOnly() || isCompletedSetup"
            >
          </div>

          <div class="flex flex-col basis-1/3">
            <label class="text-md justify-left block px-3 py-1.5 font-medium">cliente</label>
            <input
              [ngStyle]="viewOnly() ? {'cursor': 'pointer'} : {}"
              type="text"
              class="focus:outline-none p-3 rounded-md w-full border-input"
              [ngClass]="{
                      'border-input-error' : setup.customerId.invalid && setup.customerId.dirty,
                      'ddt-done' : setup.customerId.getRawValue(),
                      'disabled': !(isUserPlanner() | async)
                    }"
              placeholder="Scegli il cliente"
              matInput
              formControlName="customer"
              [matAutocomplete]="customerList"
              [readonly]="viewOnly()"
            >

            <mat-autocomplete #customerList="matAutocomplete" [displayWith]="displayCustomer"
                              (optionSelected)="onCustomerSelect($event)">
              <mat-option *ngFor="let customer of (customers$ | async)" [value]="customer"
                          (click)="changeCustomer(customer)">
                {{ customer.name }}
              </mat-option>

              <mat-option *ngIf="getCurrentCustomer?.id == -1" [value]="-1">
                <div *ngIf="getCurrentCustomer?.id == -1">{{ getCurrentCustomer.name }}</div>
              </mat-option>

              <mat-option (click)="addNewCustomCustomer()">
                <div class="font-bold">Aggiungi Nuovo</div>
              </mat-option>
            </mat-autocomplete>
          </div>

          <div class="flex flex-col basis-1/3">
            <label class="text-md justify-left block px-3 py-1.5 font-medium"
                   [ngClass]="{'text-gray-500' : !customersAddresses.length || viewOnly()}">Indirizzo</label>
            <div
              class="w-full flex shadow-md bg-foreground text-gray-900 text-sm rounded-lg border-input focus:outline-none p-3 font-bold"
              [ngClass]="{
                'ddt-done' : !customersAddresses.length,
                'disabled': !(isUserPlanner() | async)
              }">
              <mat-select id="addressId" formControlName="addressId" placeholder="Scegli l'indirizzo">
                <mat-option *ngFor="let address of customersAddresses" [value]="address.id" class="font-bold">
                  {{ address.address }}, <span *ngIf="address.number">{{ address.number }},</span> {{ address.city }}
                  <span *ngIf="address.billing">(di fatturazione)</span>
                </mat-option>

                <mat-option *ngIf="getCurrentAddress?.id == -1" [value]="getCurrentAddress.id">
                  <div>{{ getCurrentAddress.address }}, <span
                    *ngIf="getCurrentAddress.number">{{ getCurrentAddress.number }},</span> {{ getCurrentAddress.city }}
                  </div>
                </mat-option>

                <mat-option (click)="addNewCustomAddress()">
                  <div class="font-bold">Aggiungi Nuovo</div>
                </mat-option>
              </mat-select>
            </div>
          </div>
        </div>

        <div class="flex flex-col basis-1/3">
          <div class="flex flex-row basis-1/3 gap-2">
            <div class="flex flex-col basis-1/4 relative">
              <mat-label class="py-1.5">data sopralluogo</mat-label>

              <input matInput [matDatepicker]="datePicker1"
                     formControlName="date"
                     placeholder="gg/mm/yyyy"
                     class="focus:outline-none p-3 rounded-md w-full border-input"
                     [ngClass]="{
                     'viewOnly' : viewOnly(),
                     'disabled': !(isUserPlanner() | async)
                   }">
              <mat-datepicker-toggle class="absolute end-0.5 top-9"
                                     matIconSuffix
                                     [for]="datePicker1"
                                     [disabled]="!(isUserPlanner() | async)"
                                     [ngClass]="{
                                     'viewOnly' : viewOnly(),
                                   }">
                <mat-icon class="material-symbols-rounded">event</mat-icon>
              </mat-datepicker-toggle>

              <mat-datepicker #datePicker1></mat-datepicker>
            </div>

            <div class="flex flex-col basis-1/4 relative">
              <mat-label class="py-1.5">data scadenza</mat-label>

              <input matInput [matDatepicker]="datePicker2"
                     formControlName="dueDate"
                     placeholder="gg/mm/yyyy"
                     class="focus:outline-none p-3 rounded-md w-full border-input"
                     [ngClass]="{
                     'viewOnly' : viewOnly(),
                     'disabled': !(isUserPlanner() | async)
                   }">
              <mat-datepicker-toggle class="absolute end-0.5 top-9"
                                     matIconSuffix
                                     [for]="datePicker2"
                                     [disabled]="!(isUserPlanner() | async)"
                                     [ngClass]="{
                                     'viewOnly' : viewOnly(),
                                   }">
                <mat-icon class="material-symbols-rounded">event</mat-icon>
              </mat-datepicker-toggle>

              <mat-datepicker #datePicker2></mat-datepicker>
            </div>
            <div class="flex flex-col basis-1/2">
              <label class="text-md justify-left block px-3 py-1.5 font-medium"
                     [ngClass]="{'text-gray-500' : !usersParticipants.length || viewOnly()}">partecipanti</label>
              <div
                class="w-full flex shadow-md bg-foreground text-gray-900 text-sm rounded-lg border-input focus:outline-none p-3 font-bold"
                [ngClass]="{
                  'disabled': !(isUserPlanner() | async)
                }">
                <mat-select formControlName="participants" placeholder="Scegli i partecipanti" [multiple]="true">
                  <mat-option *ngFor="let user of (users$ | async)" [value]="user.id" class="font-bold">
                    {{ user.username }}
                  </mat-option>
                </mat-select>
              </div>
            </div>
          </div>

          <div class="py-1.5">
            <mat-label class="py-1.5 pl-2.5">descrizione</mat-label>

            <textarea class="focus:outline-none p-3 rounded-md w-full shadow-md" formControlName="description" rows="5"
                      [ngClass]="{
                      'border-input': !setup.description.invalid && setup.description.dirty,
                      'border-input-error': setup.description.invalid && setup.description.dirty,
                      'disabled': !(isUserPlanner() | async)
                    }"></textarea>
          </div>

          <div class="flex flex-col w-full">
            <div class="text-xl font-extrabold uppercase py-1">Allegati allestimento</div>
            <div class="overflow-x-auto default-shadow">
              <app-attachments
                [viewOnly]="viewOnly()"
                [onlyImages]="false"
                title="allegati"
                label="aggiungi allegato"
                [ngClass]="{
                  'disabled': !(isUserPlanner() | async)
                }"
                [attachmentList]="getAttachmentsObjectList(getSetupAttachments)"
                [currentAttachment]="getSetupAttachments"
                (onUpload)="onUploadSetupAttachmentFiles($event)"
                (onDeleteAttachment)="deleteSetupAttachment($event)">
              </app-attachments>
            </div>
          </div>
        </div>
      </form>

      <form [formGroup]="inspectionForm">
        <div class="py-1.5">
          <mat-label class="py-1.5 pl-2.5">esito sopralluogo</mat-label>

          <textarea class="focus:outline-none p-3 rounded-md w-full shadow-md"
                    formControlName="description"
                    rows="5"
                    [ngClass]="{
                    'border-input': !inspection.description.invalid && inspection.description.dirty,
                    'border-input-error': inspection.description.invalid && inspection.description.dirty,
                    'disabled': !(isUserInspector() | async)
                  }"></textarea>
        </div>

        <div class="flex flex-col w-full">
          <div class="text-xl font-extrabold uppercase py-1">Allegati sopralluogo</div>
          <div class="overflow-x-auto default-shadow">
            <app-attachments
              [viewOnly]="viewOnly()"
              [onlyImages]="false"
              title="allegati"
              label="aggiungi allegato"
              [ngClass]="{
                  'disabled': !(isUserInspector() | async)
                }"
              [attachmentList]="getAttachmentsObjectList(getInspectionAttachments)"
              [currentAttachment]="getInspectionAttachments"
              (onUpload)="onUploadInspectionAttachmentFiles($event)"
              (onDeleteAttachment)="deleteInspectionAttachment($event)">
            </app-attachments>
          </div>
        </div>
      </form>
    </ng-container>

    <ng-template #addAddressInInspectionTemplate>
      <app-customer-address-modal [showCheckbox]="false"/>
    </ng-template>

    <ng-template #addCustomerInInspectionTemplate>
      <app-customer-modal/>
    </ng-template>
  `,
  styles: [`
    .icon-text-success {
      color: #ECF5F0;
    }

    .icon-text-error {
      color: #F8E9E8;
    }
  `]
})
export default class EditInspectionComponent implements OnInit, OnDestroy  {
  @ViewChild("addAddressInInspectionTemplate") addAddressInOrderTemplate: TemplateRef<any> | undefined;
  @ViewChild("addCustomerInInspectionTemplate") addCustomerInOrderTemplate: TemplateRef<any> | undefined;

  currentInspectionStatusDetail: InspectionStatusDetail | undefined;
  defaultFilterOptions = { page: 1, limit: 30, sort: [{ name: "asc" }] };

  subject = new Subject();

  store: Store<AppState> = inject(Store);
  fb = inject(FormBuilder);
  dialog = inject(MatDialog);
  customerService = inject(CustomersService);
  userService = inject(UsersService);

  customers$ = this.customerService.loadCustomers({ query: {}, options: { ...this.defaultFilterOptions, populate: "addresses" } })
    .pipe(map((res: PaginateDatasource<Customer>) => res.docs));

  users$ = this.userService.loadUsers({ query: {}, options: { page: 1, limit: 30, sort: [] , populate: "" } })
    .pipe(map((res: PaginateDatasource<User>) => res.docs));

  active$ = this.store.select(getCurrentInspection)
    .pipe(takeUntilDestroyed());

  currentUser$ = this.store.select(getProfileUser);

  id = toSignal(this.store.select(selectCustomRouteParam("id")));
  viewOnly: Signal<boolean> = toSignal(this.store.select(getRouterData).pipe(
    map(data => data!["viewOnly"] ?? false)
  ));

  setUpForm = this.fb.group({
    customer: [{ value: {} as Customer, disabled: this.viewOnly() }],
    customerId: [{ value: -1, disabled: this.viewOnly() }],
    address: [{ value: {} as Address, disabled: this.viewOnly() }],
    addressId: [{ value: -1, disabled: this.viewOnly() }],
    title: [{ value: "", disabled: this.viewOnly() }, Validators.required],
    // userId was in the form, ask for future clarifications due to INSPECTOR or USER_PLANNER roles
    date: [{ value: new Date(), disabled: this.viewOnly() }, Validators.required],
    dueDate: [{ value: new Date(), disabled: this.viewOnly() }, Validators.required],
    description: [{ value: "", disabled: this.viewOnly() }, Validators.required],
    attachments: this.fb.array([]),
    participants: [[{}]],
  });

  inspectionForm = this.fb.group({
    description: [{ value: "", disabled: this.viewOnly() }, Validators.required],
    attachments: this.fb.array([]),
  })

  usersParticipants: Participant[] = [];
  customersAddresses: Address[] = [];
  initSetupFormValue: Partial<SetupForm> = {};
  initInspectionFormValue: Partial<InspectionForm> = {};
  defaultCustomersFilterOptions = { ...this.defaultFilterOptions, populate: "addresses" }

  constructor() {
    this.setup.customer.valueChanges.pipe(
      debounceTime(200),
      takeUntil(this.subject)
    ).subscribe((textOrCustomer: any) => {

      if((textOrCustomer as Setup | null)?.id) {
        return;
      }

      this.customers$ = this.customerService.loadCustomers({ query: {
          value: textOrCustomer || ""
        }, options: this.defaultCustomersFilterOptions }).pipe(map((res: PaginateDatasource<Customer>) => res.docs));

    });

  }

  get setup() {
    return this.setUpForm.controls;
  }

  get inspection() {
    return this.inspectionForm.controls;
  }

  get attachmentsInspection(): FormArray {
    return this.inspectionForm.get("attachments") as FormArray;
  }

  get attachmentsSetup(): FormArray {
    return this.setUpForm.get("attachments") as FormArray;
  }

  get isNewSetUp() {
    return this.id() === "new";
  }

  get isCompletedSetup() {
    return this.currentInspectionStatusDetail?.inspectionStatus === InspectionStatus.DONE;
  }

  get getCurrentAddress(): Address {
    return this.setup.address.value as Address;
  }

  get getCurrentCustomer(): Customer {
    return this.setup.customer.value as Customer;
  }

  get getInspectionAttachments(): string[] {
    return this.inspection.attachments.value as string[] || [];
  }

  get getSetupAttachments(): string[] {
    return this.setup.attachments.value as string[] || [];
  }

  ngOnInit() {

    if (!this.isNewSetUp) {
      this.store.dispatch(
        InspectionActions.getInspection({ id: this.id() })
      );
    }

    this.active$.subscribe((value: Inspection | any) => {
      if(!value) {
        return;
      }

      this.customersAddresses = [ value.setup.address ];

      this.currentInspectionStatusDetail = {
        inspectionStatus: value.inspectionStatus,
        rejectionReason: value.rejectionReason,
        userId: value.userId,
        user: value.user,
      };

      const currentSetupDataForm: SetupForm = {
        isInspectionNeeded: true,
        customer: value.setup.customer,
        customerId: value.setup.customerId,
        title: value.setup.title,
        address: value.setup.address,
        addressId: value.setup.addressId,
        date: value.date, //
        dueDate: value.setup.dueDate,
        description: value.setup.description,
        attachments: value.setup.attachments,
        participants: value.setup?.participants
      };

      const currentInspectionDataForm = {
        description: value.description,
        attachments: value.attachments,
      }

      this.initializeInspectionAttachment(currentInspectionDataForm.attachments ?? []);
      this.initializeAttachmentSetup(currentSetupDataForm.attachments ?? []);

      this.setUpForm.patchValue({
        ...currentSetupDataForm,
        date: typeof (currentSetupDataForm.date) === "string"
          ? new Date(currentSetupDataForm.date)
          : currentSetupDataForm.date!,
        dueDate: typeof (currentSetupDataForm.dueDate) === "string"
          ? new Date(currentSetupDataForm.dueDate)
          : currentSetupDataForm.dueDate!,
        participants: (value as Inspection)?.setup?.participants.map((p) => +p.userId) ?? []
      });

      this.inspectionForm.patchValue({
        ...currentInspectionDataForm
      })

      this.initSetupFormValue = {
        ...this.setUpForm.value,
        participants: currentSetupDataForm.participants
      } as SetupForm;

      this.initInspectionFormValue = {
        ...this.inspectionForm.value,
      } as InspectionForm;

    });

    this.editSetUpChanges();
    this.editInspectionChanges();
  }

  editSetUpChanges() {
    this.setUpForm.valueChanges.pipe(
      pairwise(),
      map(([_, newState]) => {
        if(!Object.values(this.initSetupFormValue).length && !this.isNewSetUp) {
          return {};
        }

        return createSetupPayloadFromForm(newState, this.initSetupFormValue);
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.setUpForm.invalid ? { ...changes, id: +this.id() } : {}),
      takeUntil(this.subject),
    ).subscribe((changes: any) => {
      if (!Object.keys(changes).length || (changes.customerId === -1 && !Object.keys(changes.customer ?? {}).length) || (changes.addressId === -1 && !(Object.keys(changes.address ?? {})).length)) {
        this.store.dispatch(InspectionActions.clearSetupActive());
        return;
      }

      this.store.dispatch(InspectionActions.setupActiveChanges({ changes }));
    });
  }

  editInspectionChanges() {
    this.inspectionForm.valueChanges.pipe(
      pairwise(),
      map(([_, newState]) => {
        if(!Object.values(this.initInspectionFormValue).length && !this.isNewSetUp) {
          return {};
        }

        return createInspectionPayloadFromForm(newState, this.initInspectionFormValue);
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.inspectionForm.invalid ? { ...changes, id: +this.id() } : {}),
      takeUntil(this.subject),
    ).subscribe((changes: any) => {
      if (!Object.keys(changes).length) {
        this.store.dispatch(InspectionActions.clearInspectionActiveChanges());
        return;
      }

      this.store.dispatch(InspectionActions.inspectionActiveChanges({ changes }));
    });
  }


  ngOnDestroy(): void {
    this.setUpForm.reset();

    this.store.dispatch(InspectionActions.clearSetupActive());
    this.store.dispatch(InspectionActions.clearInspectionHttpError());
  }

  addNewCustomAddress() {

    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      autoFocus: false,
      data: <ModalDialogData> {
        title: "Aggiungi indirizzo di spedizione",
        content: ``,
        templateContent: this.addAddressInOrderTemplate,
        buttons: [
          { iconName: "check", label: "Conferma", bgColor: "confirm",  onClick: () => dialogRef.close(true), selectors: { disabled: getCustomerAddressFormActiveChanges } },
          { iconName: "clear", label: "Annulla",  onClick: () => dialogRef.close(false) }
        ]
      }
    });

    dialogRef.afterClosed().pipe(
      concatLatestFrom(() => [ this.store.select(getCustomerAddressFormActiveChanges) ]),
      takeUntil(this.subject)
    ).subscribe(([ result, currentAddress ]: any) => {
      if(result) {
        this.setUpForm.patchValue({ address: currentAddress as any, addressId: -1 });
      }

      this.store.dispatch(CustomerActions.clearAddressFormActiveChanges());
    });
  }

  addNewCustomCustomer() {

    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      autoFocus: false,
      data: <ModalDialogData> {
        title: "Aggiungi un nuovo cliente",
        content: ``,
        templateContent: this.addCustomerInOrderTemplate,
        buttons: [
          { iconName: "check", label: "Conferma", bgColor: "confirm",  onClick: () => dialogRef.close(true), selectors: { disabled: getNewCustomerFormActiveChanges } },
          { iconName: "clear", label: "Annulla",  onClick: () => dialogRef.close(false) }
        ]
      }
    });

    dialogRef.afterClosed().pipe(
      concatLatestFrom(() => [ this.store.select(getNewCustomerFormActiveChanges) ]),
      takeUntil(this.subject)
    ).subscribe(([ result, currentCustomer ]: any) => {
      if(result) {
        console.log('pass to form', currentCustomer, this.setUpForm)
        this.setUpForm.patchValue({ customer: currentCustomer as any, customerId: -1 });
      }

      this.store.dispatch(CustomerActions.newClearCustomerFormActiveChanges());
    });
  }

  displayCustomer(customer: PartialCustomer): string {
    return customer?.name ?? "";
  }

  changeCustomer(customer: PartialCustomer) {
    this.customersAddresses = customer.addresses as Address[];
  }

  onCustomerSelect(event: any) {
    if (event.option.value) {
      const customer = event.option.value as Customer | any;
      this.setCurrentCustomer(customer);
    }
  }

  setCurrentCustomer(customer: PartialCustomer | any) {
    this.setUpForm.controls.customerId.setValue( customer.id);
  }

  isUserPlanner(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user =>
        hasRoles(user, [{ role: Roles.USER_PLANNER }])
      )
    );
  }

  isUserInspector(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user =>
        hasRoles(user, [{ role: Roles.USER_INSPECTOR }])
      )
    );
  }

  initializeInspectionAttachment(attachmentsArray: string[]): void {
    this.attachmentsInspection.clear();

    attachmentsArray.forEach(() => this.attachmentsInspection.push(
      this.fb.control("")
    ));
  }

  onUploadInspectionAttachmentFiles(images: string[]) {
    this.initializeInspectionAttachment(images);

    this.inspectionForm.patchValue({
      attachments: images
    });
  }

  deleteInspectionAttachment(i: number): void {
    this.attachmentsInspection.removeAt(i);
  }

  initializeAttachmentSetup(attachmentsArray: string[]): void {
    this.attachmentsSetup.clear();

    attachmentsArray.forEach(() => this.attachmentsSetup.push(
      this.fb.control("")
    ));
  }

  onUploadSetupAttachmentFiles(images: string[]) {
    this.initializeAttachmentSetup(images);

    this.setUpForm.patchValue({
      attachments: images
    });
  }

  deleteSetupAttachment(i: number): void {
    this.attachmentsSetup.removeAt(i);
  }

  protected readonly getAttachmentsObjectList = getAttachmentsObjectList;
}
