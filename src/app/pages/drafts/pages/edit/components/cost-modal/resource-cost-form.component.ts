import {Component, inject} from "@angular/core";
import {MatIconModule} from "@angular/material/icon";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {ResourcesService} from "../../../../../resources/services/resources.service";
import {debounceTime, map} from "rxjs/operators";
import {PaginateDatasource} from "../../../../../../models/Table";
import {Resource} from "src/app/models/Resource";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatInputModule} from "@angular/material/input";
import {MatOptionModule} from "@angular/material/core";
import {pairwise, Subject, takeUntil} from "rxjs";
import * as DraftsActions from "../../../../store/actions/drafts.actions";
import {Store} from "@ngrx/store";
import {AppState} from "../../../../../../app.config";
import {Cost} from "../../../../../../models/Setup";
import {TemplateDrivenInputComponent} from "./template-driven-input.component";

@Component({
  selector: 'app-resource-cost-form',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, MatAutocompleteModule, MatInputModule, MatOptionModule, TemplateDrivenInputComponent],
  template: `
    <form [formGroup]="resourceForm">
      <div class="flex flex-col gap-2">

        <div class="flex flex-col basis-1/3">
          <label class="text-md justify-left block px-3 py-1.5 font-medium">Risorsa</label>

          <input
            type="text"
            class="focus:outline-none p-3 rounded-md w-full border-input"
            [ngClass]="{
              'border-input-error' : f.resourceId.invalid && f.resourceId.dirty,
            }"
            placeholder="Scegli la risorsa"
            matInput
            formControlName="resource"
            [matAutocomplete]="resourceList"
          >

          <mat-autocomplete #resourceList="matAutocomplete" [displayWith]="displayResource"
                            (optionSelected)="onResourceSelect($event)">
            <mat-option *ngFor="let customer of (resources$ | async)" [value]="customer">
              {{ customer.name }}
            </mat-option>
          </mat-autocomplete>
        </div>

        <div class="flex flex-col w-full">
          <app-template-driven-input
            id="resource-quantity"
            type="text"
            [label]=quantityLabel
            [formControlName]="'quantity'"
            [dirty]="f.quantity.dirty"
            [invalid]="f.quantity.invalid"
            [errors]="f.quantity.errors"
          />
        </div>
      </div>
    </form>
  `,
  styles: [``]
})
export class ResourceCostFormComponent {
  resourcesService = inject(ResourcesService);
  fb = inject(FormBuilder);
  store: Store<AppState> = inject(Store);

  subject = new Subject();
  resourceForm = this.fb.group({
    resource: [{} as Resource],
    resourceId: [-1],
    quantity: [1, [Validators.required, Validators.min(0)]],
  });
  defaultFilterOptions = {page: 1, limit: 30};

  resources$ = this.resourcesService.loadResources({query: {}, options: {...this.defaultFilterOptions}})
    .pipe(map((res: PaginateDatasource<Resource>) => res.docs));

  constructor() {
    this.store.dispatch(DraftsActions.clearCostsActiveChanges());
    this.f.resource.valueChanges.pipe(
      debounceTime(200),
      takeUntil(this.subject)
    ).subscribe((textOrResource: any) => {
      if ((textOrResource as Resource | null)?.id) {
        return;
      }

      this.resources$ = this.resourcesService.loadResources({
        query: {value: textOrResource || ""},
        options: this.defaultFilterOptions
      }).pipe(map((res: PaginateDatasource<Resource>) => res.docs));
    });

    this.resourceForm.patchValue({
      resourceId: -1,
      resource: null,
      quantity: 1,
    })

    this.editResourceFormChanges();
  }

  editResourceFormChanges() {
    this.resourceForm.valueChanges.pipe(
      pairwise(),
      map(([_, newState]) => newState),
      takeUntil(this.subject),
    ).subscribe(current => {
      const newCost = Object.keys(current).length !== 0 && !this.resourceForm.invalid ? {
        ...current,
        id: -1
      } as Cost : undefined;

      if (!newCost || !newCost.resource) {
        return this.store.dispatch(DraftsActions.clearCostsActiveChanges());
      }
      this.store.dispatch(DraftsActions.editCostsActiveChanges({
        changes:
          [{
            ...newCost,
            price: +newCost.resource.hourlyCost,
            quantity: +newCost.quantity,
          }]
      }))
    });
  }

  get f() {
    return this.resourceForm.controls;
  }

  get quantityLabel() {
    return `Ore di lavoro ${this.f.resource.value?.hourlyCost ? `(${this.f.resource.value?.hourlyCost}€/h)` : ''}`;
  }

  displayResource(resource: Resource): string {
    return resource?.name ?? "";
  }

  onResourceSelect(event: any) {
    if (event.option.value) {
      const resource = event.option.value as Resource | any;
      this.resourceForm.controls.resourceId.setValue(resource.id);
    }
  }
}
