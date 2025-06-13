import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from "../../../../components/input/input.component";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { combineLatest, concatMap, of, startWith, Subject, takeUntil } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";
import { selectCustomRouteParam, selectRouteQueryParamParam } from "../../../../core/router/store/router.selectors";
import { ProductsService } from "../../../products/services/products.service";
import { ButtonSquareComponent } from "../../../../components/button-square/button-square.component";
import * as CargoActions from "../../store/actions/cargos.actions";
import { MoveProductDTO, PartialProduct, Product } from "../../../../models/Product";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { PartialWarehouse, Warehouse } from "../../../../models/Warehouse";
import { MatIconModule } from "@angular/material/icon";
import { MoveActionComponent } from "./components/move-action/move-action.component";
import { debounceTime } from "rxjs/operators";
import { getCargosHttpError } from "../../store/selectors/cargos.selectors";
import { SearchProductComponent } from "./components/search-product/search-product.component";
import { SearchWarehouseComponent } from "./components/search-warehouse/search-warehouse.component";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: 'app-edit-cargo',
  standalone: true,
  imports: [ CommonModule, InputComponent, ReactiveFormsModule, MatAutocompleteModule, ButtonSquareComponent, MatIconModule, MoveActionComponent, SearchProductComponent, SearchWarehouseComponent, MatInputModule ],
  template: `
    <form [formGroup]="cargoForm">
      <div class="flex flex-wrap -mx-1">
        <div class="flex flex-col w-full lg:w-1/2 px-1">
          <app-search-warehouse [resetFormSubject]="resetProductFormSubject"
                                [wareHouseIdField]="cargoForm.controls.currentWarehouseId"
                                formControlName="currentWarehouse"
                                (onSelectionCurrentWarehouseChange)="onSelectionCurrentWarehouseChange($event)"></app-search-warehouse>
        </div>
        <div class="flex flex-col w-full lg:w-1/2 px-1">
          <app-search-product [productIdField]="cargoForm.controls.productId"
                              [resetFormSubject]="resetProductFormSubject"
                              formControlName="product"
                              (onSelectionProductChange)="onSelectionProductChange($event)"
          ></app-search-product>
        </div>
      </div>
      <div class="flex flex-wrap gap-y-2 -mx-1 pt-3">
        <div class="flex flex-col w-full lg:w-1/2 px-1" style="max-height: 4.5rem">
          <app-input [formControl]="f.quantityToMove" formControlName="quantityToMove" [label]="getQuantityLabel"
                     type="number" id="product-purchase-quantityToMove"></app-input>
        </div>
        <div class="flex flex-wrap gap-y-2 items-end w-full lg:w-1/2 px-1">
          <div *ngIf="!renderChooseButtons" class="flex flex-col w-full lg:w-1/3">
            <app-button-square [disabled]="availableQuantity === '0' || cargoForm.invalid" iconName="remove" label="Scarica"
                               bgColor="#F8E9E8" color="#E54F47"
                               (onClick)="move('remove')"></app-button-square>
          </div>
          <div *ngIf="!renderChooseButtons" class="flex flex-col w-full lg:w-1/3">
            <app-button-square [disabled]="cargoForm.invalid" iconName="add" label="Carica" bgColor="#ECF5F0" color="#70C995"
                               (onClick)="move('add')"></app-button-square>
          </div>
          <div class="grow">
            <app-move-action
              [renderChooseButtons]="renderChooseButtons"
              (updateRenderChooseButtons)="renderChooseButtons = $event"
              (exitToMove)="exitToMoveClick()"
              (move)="move('add')"
              [disabled]="availableQuantity === '0' || cargoForm.invalid"
              [arrowDisabled]="!!cargoForm.getRawValue().destinationWarehouse">
              <app-search-warehouse [fromWareHouseId]="f.currentWarehouseId.getRawValue() || 0"
                                    formControlName="destinationWarehouse"
                                    [resetFormSubject]="resetProductFormSubject"
                                    (onSelectionCurrentWarehouseChange)="onSelectionDestinationWarehouseChange($event)"
                                    [wareHouseIdField]="f.destinationWarehouseId"
                                    [inputLabel]="'destinazione movimento'"></app-search-warehouse>
            </app-move-action>
          </div>
        </div>
      </div>
      <div class="pt-3">
        <app-input [formControl]="f.note" formControlName="note" label="note" type="text" id="note"></app-input>
      </div>
    </form>
  `,
  styles: [`
    .mat-mdc-option:focus.mdc-list-item, .mat-mdc-option.mat-mdc-option-active.mdc-list-item {
      background-color: lightgray;
    }
  `],
})
export default class EditCargoComponent implements OnDestroy {

  store: Store<AppState> = inject(Store);
  productsService = inject(ProductsService);

  subject = new Subject();

  resetProductFormSubject: Subject<boolean> = new Subject<boolean>();
  resetWareHouseFormSubject: Subject<boolean> = new Subject<boolean>();


  fb = inject(FormBuilder);

  id = toSignal(this.store.select(selectCustomRouteParam("id")));
  queryParams = toSignal(this.store.select(selectRouteQueryParamParam()));

  cargoForm = this.fb.group({
    // name: ["", Validators.required],
    currentWarehouseId: [0, Validators.required],
    currentWarehouse: [],
    productId: [0, Validators.required],
    product: [""],
    quantityToMove: [0, Validators.required],
    destinationWarehouseId: [0],
    destinationWarehouse: [],
    note: [""]
  });

  destinationWarehousesOptions: Warehouse[] = [];
  allWarehouses: Warehouse[] = [];

  renderChooseButtons: boolean = false;
  availableQuantity: string = "";

  get f() {
    return this.cargoForm.controls;
  }

  get getQuantityLabel() {
    if(this.cargoForm.getRawValue().quantityToMove) {
      return `
    <div>
       quantità <span class="blue"> ${this.availableQuantity ? 'disponibili: ' + this.availableQuantity : ''} </span>
    </div>
    `
    }
    return `quantità`
  }

  constructor() {
    this.cargoForm.reset();

    this.f.destinationWarehouse.valueChanges.pipe(
      debounceTime(250),
      takeUntil(this.subject)
    ).subscribe((textOrWarehouse) => {
      if ((textOrWarehouse as Warehouse | null)?.id) {
        this.destinationWarehousesOptions = this.allWarehouses;
        return;
      }

      this.destinationWarehousesOptions = this.allWarehouses.filter(warehouse =>
        warehouse.name.toLowerCase().includes((textOrWarehouse as string | null)?.toLowerCase() ?? '')
      );
    });

    combineLatest([
      this.cargoForm.get("currentWarehouseId")!.valueChanges.pipe(startWith("")),
      this.cargoForm.get("productId")!.valueChanges.pipe(startWith(""))
    ]).pipe(
        concatMap(([ currentWarehouseId, productId ]) => {
          if (!currentWarehouseId || !productId) {
            return of(undefined);
          }
          return this.productsService.getProductQuantityRemain(productId as string, currentWarehouseId as string);
        }),
      takeUntil(this.subject)
    ).subscribe((quantity) => {
      if (!quantity) {
        return;
      }
      this.availableQuantity = `${ quantity.quantity }`
    });

    this.store.select(getCargosHttpError).pipe(
      takeUntil(this.subject)
    ).subscribe(res => {
      if(res && !Object.values(res).length) {
        // Resetta il form ogni volta che un l'errore viene settato su undefined
        this.resetFormData();
      }
    });

  }

  move(mode: "add" | "remove") {
    if(this.cargoForm.invalid) {
      return;
    }

    const form = (this.cargoForm.value as MoveProductDTO);

    const payload = {
      currentWarehouseId: +form.currentWarehouseId,
      quantityToMove: +form.quantityToMove,
      productId: +form.productId,
      destinationWarehouseId: form.destinationWarehouseId ? +form.destinationWarehouseId : undefined,
      note: form.note || undefined
    };

    if(mode === "remove") {
      return this.store.dispatch(CargoActions.createCargo({ cargo: { ...payload, quantityToMove: -payload.quantityToMove } }));
    }

    this.store.dispatch(CargoActions.createCargo({ cargo: payload }));

  }

  onSelectionProductChange(evt: any) {
    const pr = evt.option.value as Product | any;
    this.setProduct(pr);
  }

  setProduct(product: PartialProduct | any) {
    this.cargoForm.patchValue({ productId: product.id, product });
  }

  onSelectionCurrentWarehouseChange(evt: any) {
    const wh = evt.option.value as Warehouse | any;
    this.setCurrentWarehouse(wh);
  }

  onSelectionDestinationWarehouseChange(evt: any) {
    const wh = evt.option.value as Warehouse | any;
    this.setDestinationWarehouse(wh);
  }

  setCurrentWarehouse(warehouse: PartialWarehouse | any) {
    this.cargoForm.patchValue({ currentWarehouseId: warehouse.id, currentWarehouse: warehouse });
  }

  setDestinationWarehouse(warehouse: PartialWarehouse | any) {
    this.cargoForm.patchValue({ destinationWarehouseId: warehouse.id, destinationWarehouse: warehouse });
  }

  displayFn(um: Product): string {
    return um && um.name ? um.name : "";
  }

  exitToMoveClick(): void {
    this.cargoForm.controls['destinationWarehouseId'].reset();
  }

  resetFormData() {
    this.cargoForm.reset();
    this.availableQuantity = "";
    this.resetProductFormSubject.next(true);
    this.resetWareHouseFormSubject.next(true);
  }

  ngOnDestroy() {
    this.cargoForm.reset();

    this.store.dispatch(CargoActions.clearCargoActive());
    this.store.dispatch(CargoActions.clearCargoHttpError());
  }
}
