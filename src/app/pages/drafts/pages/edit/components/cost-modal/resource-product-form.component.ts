import { Component, inject } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { map } from "rxjs/operators";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { MatOptionModule } from "@angular/material/core";
import { pairwise, Subject, takeUntil } from "rxjs";
import * as DraftsActions from "../../../../store/actions/drafts.actions";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../../../app.config";
import { Cost } from "../../../../../../models/Setup";
import { TemplateDrivenInputComponent } from "./template-driven-input.component";
import { MatSelectModule } from "@angular/material/select";

@Component({
  selector: 'app-resource-product-form',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, MatAutocompleteModule, MatInputModule, MatOptionModule, TemplateDrivenInputComponent, MatSelectModule],
  template: `
    <form [formGroup]="productForm" class="flex flex-col gap-2">
      <app-template-driven-input
        id="product-description"
        type="text"
        label="nome articolo"
        formControlName="description"
        [dirty]="f.description.dirty"
        [invalid]="f.description.invalid"
        [errors]="f.description.errors"
      />

      <app-template-driven-input
        id="product-unitMeasure"
        type="text"
        label="unità di misura"
        formControlName="unitOfMeasure"
        placeholder="pz, m, m2, g ..."
        [dirty]="f.unitOfMeasure.dirty"
        [invalid]="f.unitOfMeasure.invalid"
        [errors]="f.unitOfMeasure.errors"
      />

      <app-template-driven-input
        id="product-quantity"
        type="text"
        label="quantità"
        formControlName="quantity"
        [dirty]="f.quantity.dirty"
        [invalid]="f.quantity.invalid"
        [errors]="f.quantity.errors"
      />

      <app-template-driven-input
        id="product-price"
        type="text"
        label="costo totale"
        formControlName="price"
        unitMeasure="€"
        [dirty]="f.price.dirty"
        [invalid]="f.price.invalid"
        [errors]="f.price.errors"
      />
    </form>
  `,
  styles: [``]
})
export class ResourceProductFormComponent {
  fb = inject(FormBuilder);
  store: Store<AppState> = inject(Store);

  subject = new Subject();
  productForm = this.fb.group({
    description: ["", Validators.required],
    unitOfMeasure: ["", Validators.required],
    quantity: [1, [Validators.required, Validators.min(0)]],
    price: [1, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    this.store.dispatch(DraftsActions.clearCostsActiveChanges());
    this.editProductFormChanges();
  }

  editProductFormChanges() {
    this.productForm.valueChanges.pipe(
      pairwise(),
      map(([_, newState]) => newState),
      takeUntil(this.subject),
    ).subscribe(current => {
      const newCost = Object.keys(current).length !== 0 && !this.productForm.invalid ? { ...current, id: -1 } as Cost : undefined;

      if (!newCost) {
        return this.store.dispatch(DraftsActions.clearCostsActiveChanges());
      }

      this.store.dispatch(DraftsActions.editCostsActiveChanges({
        changes: [newCost]
      }))
    });
  }

  get f() {
    return this.productForm.controls;
  }

}
