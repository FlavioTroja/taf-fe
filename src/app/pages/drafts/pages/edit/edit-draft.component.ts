import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Customer, PartialCustomer } from "../../../../models/Customer";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { MatNativeDateModule, MatOptionModule } from "@angular/material/core";
import { Address } from "../../../../models/Address";
import { map } from "rxjs/operators";
import { PaginateDatasource } from "../../../../models/Table";
import { CustomersService } from "../../../customers/services/customers.service";
import { UsersService } from "../../../users/services/users.service";
import { MatSelectModule } from "@angular/material/select";
import {
  Cost,
  createDraftPayloadFromForm,
  mapSetupComplexity,
  Participant,
  Setup,
  SetupDraftForm,
} from "../../../../models/Setup";
import { User } from "../../../../models/User";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatIconModule } from "@angular/material/icon";
import { AttachmentsComponent } from "../../../../components/attachments/attachments.component";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import {getCostsChanges, getCurrentCost, getCurrentSetup} from "../../store/selectors/drafts.selectors";
import * as SetupActions from "../../../drafts/store/actions/drafts.actions";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import { pairwise, Subject, takeUntil } from "rxjs";
import { StatusPillComponent } from "../../../../components/pill/status-pill.component";
import { DraftCostModalComponent } from "./components/cost-modal/draft-cost-modal.component";
import DraftCostComponent from "./components/draft-cost.component";
import { difference } from "../../../../../utils/utils";
import { InputComponent } from "../../../../components/input/input.component";
import { TaskCardComponent } from "./components/task-card.component";
import { Task } from "../../../../models/Task";
import { HideByCodeSelectorDirective } from "../../../../shared/directives/hide-by-code-selector.directive";


@Component({
  selector: 'app-edit-draft',
  standalone: true,
  imports: [CommonModule, StatusPillComponent, MatAutocompleteModule, MatInputModule, MatOptionModule, ReactiveFormsModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatIconModule, AttachmentsComponent, MatDialogModule, DraftCostModalComponent, DraftCostComponent, InputComponent, TaskCardComponent, HideByCodeSelectorDirective],
  template: `
    <div class="flex flex-col" *ngIf="(active$ | async) as setup">

      <div class="text-xl font-extrabold uppercase gap-1 py-1">INFORMAZIONI GENERALI</div>
      <app-status-pill [status]="setup.isInspectionNeeded ? 'SETUP' : 'SERVICE'"/>

      <form [formGroup]="draftForm">
        <div class="flex basis-1/2 gap-2">
          <div class="flex flex-col basis-1/2">
            <label class="text-md justify-left block px-3 py-1.5 font-medium">titolo</label>
            <input
              type="text"
              class="focus:outline-none p-3 rounded-md w-full border-input"
              [ngClass]="{
                      'border-input-error' : f.title.invalid && f.title.dirty,
                      'ddt-done' : f.title.getRawValue(),
                      'disabled': setup.setupStatus !== 'DRAFT'
                    }"
              placeholder="Allestimento X"
              matInput
              formControlName="title"
            >
          </div>
          <div class="flex flex-col basis-1/2">
            <label class="text-md justify-left block px-3 py-1.5 font-medium">cliente</label>
            <input
              type="text"
              class="focus:outline-none p-3 rounded-md w-full border-input cursor-pointer disabled"
              [ngClass]="{
                      'border-input-error' : f.customerId.invalid && f.customerId.dirty,
                      'ddt-done' : f.customerId.getRawValue(),
                    }"
              placeholder="Scegli il cliente"
              matInput
              formControlName="customer"
              [matAutocomplete]="customerList"
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
            </mat-autocomplete>
          </div>
        </div>

        <div class="flex basis-1/2 gap-2">
          <div class="w-full basis-1/3">
            <div class="flex flex-col">
              <label class="text-md justify-left block px-3 py-1.5 font-medium">complessità</label>
              <div
                class="w-full flex shadow-md bg-foreground text-gray-900 text-sm rounded-lg border-input focus:outline-none p-3 font-bold">
                <mat-select formControlName="complexity" placeholder="Scegli il grado di complessità">
                  <mat-option *ngFor="let value of mapSetupComplexity" [value]="value.rank" class="font-bold">
                    {{ value.name }}
                  </mat-option>
                </mat-select>
              </div>
            </div>
          </div>

          <div class="flex flex-col basis-1/3">
            <label class="text-md justify-left block px-3 py-1.5 font-medium">partecipanti</label>
            <div
              class="w-full flex shadow-md bg-foreground text-gray-900 text-sm rounded-lg border-input focus:outline-none p-3 font-bold">
              <mat-select formControlName="participants" placeholder="Scegli i partecipanti" [multiple]="true">
                <mat-option *ngFor="let user of (users$ | async)" [value]="user.id" class="font-bold">
                  {{ user.username }}
                </mat-option>
              </mat-select>
            </div>
          </div>

          <div class="flex flex-col basis-1/3 relative">
            <mat-label class="px-3 py-1.5">data consegna</mat-label>

            <input matInput [matDatepicker]="datePicker"
                   formControlName="dueDate"
                   placeholder="gg/mm/yyyy"
                   class="focus:outline-none p-3 rounded-md w-full border-input">
            <mat-datepicker-toggle class="absolute end-0.5 top-9"
                                   matIconSuffix
                                   [for]="datePicker">
              <mat-icon class="material-symbols-rounded">event</mat-icon>
            </mat-datepicker-toggle>

            <mat-datepicker #datePicker></mat-datepicker>
          </div>
        </div>

        <div class="flex flex-col py-1.5" *ngIf="setup?.inspection?.description">
          <div class="px-3 cursor-default">
            Esito sopralluogo
          </div>
          <div class="bg-foreground p-3 rounded-md w-full shadow-md cursor-default opacity-60">
            {{ setup?.inspection?.description ?? "Nessuna descrizione per il sopralluogo" }}
          </div>
        </div>

        <div class="py-1.5">
          <mat-label class="py-1.5 pl-2.5">descrizione</mat-label>

          <textarea class="focus:outline-none p-3 rounded-md w-full shadow-md" formControlName="description" rows="5"
                    [ngClass]="{
              'border-input': !f.description.invalid && f.description.dirty,
              'border-input-error': f.description.invalid && f.description.dirty
            }"></textarea>
        </div>

        <div class="text-xl font-extrabold uppercase py-1">Allegati Allestimento</div>
        <div class="overflow-x-auto default-shadow">
          <app-attachments
            [onlyImages]="false"
            title="allegati"
            label="aggiungi allegato"
            [attachmentList]="getAttachmentsObjectList(getAttachments)"
            [currentAttachment]="getAttachments"
            (onUpload)="onUploadAttachmentFiles($event)"
            (onDeleteAttachment)="deleteAttachment($event)">
          </app-attachments>
        </div>
      </form>

      <div class="text-xl font-extrabold uppercase py-1">TASK</div>
      <div class="flex flex-col w-full gap-2.5">
        <app-task-card
          *ngFor="let task of this.f.tasks.value; index as i"
          [task]="task"
          (onSave)="onTaskSaveChanges($event)"
          (onDelete)="onTaskDelete(i)"
        />

        <div *ngIf="canAddTask() && !isTaskFormOpen " class="w-full flex justify-center">
          <div class="bg-foreground flex w-44 gap-2 py-2 px-2.5 rounded-md shadow-md cursor-pointer select-none">
            <mat-icon class="material-symbols-rounded">add</mat-icon>
            <span (click)="toggleIsTaskFormOpen()">Aggiungi Task</span>
          </div>
        </div>

        <app-task-card
          *ngIf="isTaskFormOpen"
          [isOnCreate]="true"
          (onSave)="onTaskSaveChanges($event)"
          (onCloseCreationForm)="isTaskFormOpen = false">
        </app-task-card>
      </div>

      <div *fbHideByCodeSelector="'edit.draft.costs-container'">
        <div class="text-xl font-extrabold uppercase py-1">Costi</div>

        <div class="flex flex-col gap-2.5 items-center w-full">
          <div class="flex flex-col gap-1 w-full">
            <app-draft-cost
              *ngFor="let cost of f.costs.value; index as i"
              [isEdit]="true"
              [cost]="cost"
              (onDelete)="onCostDelete(i)"
              (onCostQuantityChange)="handleCostChangeData($event)"
              class="w-full"
            />
          </div>

          <button class="flex gap-2 justify-center items-center bg-foreground rounded-[5px] py-2 px-3 shadow-md"
                  (click)="onAddNewCost()">
            <mat-icon class="material-symbols-rounded">add</mat-icon>
            Aggiungi costo
          </button>
        </div>

        <div class="flex justify-between text-xl uppercase py-1" *ngIf="!!f.costs.value?.length || f.totalTaxable.value">
          <b>Costo totale</b>
          <span>€{{ totalPrice.toFixed(2) }}</span>
        </div>


        <app-input
          *ngIf="!!f.costs.value?.length || f.totalTaxable.value"
          [formControl]="f.totalTaxable"
          [placeholder]="recommendedPrice + '\xa0 (prezzo suggerito)'"
          unitMeasure="€"
          label="prezzo suggerito"
          type="number"
          id="draft-totalTaxable"
        />
      </div>
    </div>

    <ng-template #addCostInDraftTemplate>
      <app-draft-cost-modal />
    </ng-template>
  `,
  styles: [`
    .icon-size {
      font-size: 32px;
      width: auto;
      height: auto;
    }
  `]
})
export default class EditDraftComponent implements OnInit {
  @ViewChild("addCostInDraftTemplate") addCostInDraftTemplate!: TemplateRef<any>;

  store: Store<AppState> = inject(Store);
  fb = inject(FormBuilder);
  dialog = inject(MatDialog);
  subject = new Subject();

  customerService = inject(CustomersService);
  userService = inject(UsersService);

  id = toSignal(this.store.select(selectCustomRouteParam("id")));
  currentCost = toSignal(this.store.select(getCurrentCost));
  costsChanges = toSignal(this.store.select(getCostsChanges));

  isTaskFormOpen: boolean = false;
  defaultFilterOptions = { page: 1, limit: 30, sort: [{ name: "asc" }] };
  initFormValue?: SetupDraftForm;
  customersAddresses: Address[] = [];

  viewOnly: boolean = window.location.pathname.includes("/view");

  customers$ = this.customerService.loadCustomers({ query: {}, options: { ...this.defaultFilterOptions, populate: "addresses" } })
    .pipe(map((res: PaginateDatasource<Customer>) => res.docs));

  users$ = this.userService.loadUsers({ query: {}, options: { page: 1, limit: 30, sort: [] , populate: "" } })
    .pipe(map((res: PaginateDatasource<User>) => res.docs));

  active$ = this.store.select(getCurrentSetup)
    .pipe(takeUntilDestroyed());

  draftForm = this.fb.group({
    title: ["", Validators.required],
    customer: [{} as Customer, Validators.required],
    customerId: [-1, Validators.required],
    complexity: [0, Validators.required],
    participants: [[{}]],
    dueDate: [new Date(), Validators.required],
    totalTaxable: [0],
    description: ["", Validators.required],
    attachments: this.fb.array([]),
    tasks: [[{} as Task]],
    costs: [[{} as Cost]],
  })

  get f() {
    return this.draftForm.controls;
  }

  get getCurrentCustomer(): Customer {
    return this.f.customer.value as unknown as Customer;
  }

  get getCurrentTasks(): Task[] {
    return this.f.tasks.value as Task[];
  }

  get getAttachments(): string[] {
    return this.f.attachments.value as string[] || [];
  }

  get attachments(): FormArray {
    return this.draftForm.get("attachments") as FormArray;
  }

  get totalPrice() {
    return (this.f.costs.value ?? []).reduce((previousValue, currentValue) => previousValue + (+currentValue.price) * +currentValue.quantity, 0)
  }

  get costs() {
    return this.f.costs.value;
  }

  get recommendedPrice() {
    return (this.totalPrice * 3).toFixed(2)
  }

  ngOnInit() {
    this.store.dispatch(
      SetupActions.getSetup({
        id: this.id()
      })
    );

    this.active$.subscribe((value: Setup | any) => {
      if (!value) {
        return;
      }

      const currentDraftSetupData: SetupDraftForm = {
        customer: value.customer,
        customerId: value.customerId,
        title: value.title,
        complexity: value.complexity,
        participants: value.participants,
        dueDate: value.dueDate,
        description: value.description,
        attachments: value.attachments,
        tasks: value.tasks,
        costs: value.costs,
        totalTaxable: value.totalTaxable === 0 ? null : value.totalTaxable,
      };

      this.initializeAttachments(currentDraftSetupData.attachments ?? []);

      this.draftForm.patchValue({
        ...currentDraftSetupData,
        dueDate: typeof (currentDraftSetupData.dueDate) === "string"
          ? new Date(currentDraftSetupData.dueDate)
          : currentDraftSetupData.dueDate!,
        participants: value?.participants?.map((p: Participant) => +p.userId) ?? []
      });


      this.initFormValue = {
        ...this.draftForm.value,
        participants: currentDraftSetupData.participants
      } as SetupDraftForm;
    })
    this.editSetupDraftChanges()
  }

  editSetupDraftChanges() {
    this.draftForm.valueChanges.pipe(
      pairwise(),
      map(([_, newState]) => {
        if(!Object.values(this.initFormValue ?? {}).length) {
          return {};
        }
        const diff = {
          ...difference(this.initFormValue, newState),

          dueDate: typeof (newState.dueDate) === "string"
          ? new Date(newState.dueDate)
          : newState.dueDate!,
          costs: newState.costs,
          tasks: newState.tasks,
          participants: newState.participants
        };

        return createDraftPayloadFromForm(diff, this.initFormValue!);
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.draftForm.invalid ? { ...changes, id: +this.id() } : {}),
      takeUntil(this.subject),
    ).subscribe((changes: any) => {
      if (!Object.keys(changes).length || (changes.customerId === -1 && !Object.keys(changes.customer ?? {}).length) || (changes.addressId === -1 && !(Object.keys(changes.address ?? {})).length)) {
        this.store.dispatch(SetupActions.clearSetupChanges());
        return;
      }

      console.log(changes)

      this.store.dispatch(SetupActions.setupActiveChanges({ changes }));
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
      console.log(customer);
      this.setCurrentCustomer(customer);
    }
  }

  setCurrentCustomer(customer: PartialCustomer | any) {
    this.draftForm.controls.customerId.setValue( customer.id);
  }

  getAttachmentsObjectList(attachments: string[]) {
    return attachments.map(url => {
      const arr = (url as string).split(".");
      return {
        value: url,
        type: arr[arr.length - 1],
        name: arr[arr.length - 2] + arr[arr.length - 1]
      };
    });
  }

  initializeAttachments(attachmentsArray: string[]): void {
    this.attachments.clear();

    attachmentsArray.forEach(() => this.attachments.push(
      this.fb.control("")
    ));
  }

  onUploadAttachmentFiles(images: string[]) {
    this.initializeAttachments(images);

    this.draftForm.patchValue({
      attachments: images
    });
  }

  deleteAttachment(i: number): void {
    this.attachments.removeAt(i);
  }

  async onAddNewCost() {
    const dialogRef: any = this.dialog.open(DraftCostModalComponent, {
      data: { onClose: (isSuccessful: boolean) => dialogRef.close(isSuccessful) }
    });

    dialogRef.afterClosed().subscribe(async (result: boolean) => {
      if(!result) {
        return;
      }

      const cost = this.costsChanges() as Cost[];
      this.f.costs.patchValue(this.mergeNewCosts(this.f.costs.value ?? [], this.costsChanges() as Cost[]));
      console.log('gg', this.f.costs)
    });
  }

  private mergeNewCosts = (existing: Cost[], newCosts: Cost[]): Cost[] =>
    newCosts
      .filter(cost => cost.id === undefined || cost.id < 0)
      .reduce((merged: Cost[], newCost) => {
        const existingIndex = merged.findIndex(e =>
          (newCost.resourceId && e.resourceId === newCost.resourceId) ||
          (newCost.productId && e.productId === newCost.productId)
        );
        if (existingIndex > -1) {
          merged[existingIndex] = { ...merged[existingIndex], quantity: (merged[existingIndex].quantity ?? 0) + (newCost.quantity ?? 0) };
        } else {
          merged.push(newCost);
        }
        return merged;
      }, [...existing]);

  onTaskSaveChanges(event: any) {
    const currentFormTasks = this.f.tasks.value as Task[];

    let filteredTasks = currentFormTasks
      .filter(task => task.id !== -1)
      .map(task => ({
        ...task,
        toBeDisconnected: true,
      }));

    const existingTaskIndex = filteredTasks.findIndex(task => task.id === event.id);

    if (existingTaskIndex !== -1) {
      filteredTasks[existingTaskIndex] = {
        ...filteredTasks[existingTaskIndex],
        description: event.description,
        taskSteps: event.taskSteps,
        toBeDisconnected: false,
      };
    } else {
      filteredTasks.push({
        id: event.id ?? -1,
        title: event.title,
        description: event.description,
        taskSteps: event.taskSteps,
        toBeDisconnected: false,
      });
    }

    console.log('Updated tasks:', filteredTasks);

    this.draftForm.patchValue({ tasks: filteredTasks });

    this.isTaskFormOpen = false;
  }

  toggleIsTaskFormOpen() {
    this.isTaskFormOpen = !this.isTaskFormOpen;
  }

  onTaskDelete(index: number) {
    const tasks = [...(this.f.tasks.value ?? [])];
    tasks.splice(index, 1);

    this.f.tasks.patchValue([...tasks]);
  }

  onCostDelete(index: number) {
    const costs = [...(this.f.costs.value ?? [])];
    costs.splice(index, 1);

    this.f.costs.patchValue([...costs]);
  }

  canAddTask(): boolean {
    return this.getCurrentTasks.some(task => task.toBeDisconnected === true) && this.getCurrentTasks.length > 0 && this.getCurrentTasks.length < 2 || this.getCurrentTasks.length === 0;
  }

  handleCostChangeData(data : Cost) {
    this.draftForm.patchValue({
      costs: this.costs?.map((cost) => {
        if (cost.id === data.id) {
          return {
            ...cost,
            quantity: data.quantity
          }
        }
        return cost;
      })
    })
  }


  protected readonly mapSetupComplexity = mapSetupComplexity;
  protected readonly console = console;
}
