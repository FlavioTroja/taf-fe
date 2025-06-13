import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import EditCargoComponent from "../edit/edit-cargo.component";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { ProductsService } from "../../../products/services/products.service";
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  map,
  merge,
  of,
  pairwise,
  startWith,
  Subject,
  takeUntil
} from "rxjs";
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { PartialWarehouse, Warehouse } from "../../../../models/Warehouse";
import { PartialProduct, Product } from "../../../../models/Product";
import { debounceTime } from "rxjs/operators";
import * as CargoActions from "../../store/actions/cargos.actions";
import { SearchProductComponent } from "../edit/components/search-product/search-product.component";
import { SearchWarehouseComponent } from "../edit/components/search-warehouse/search-warehouse.component";
import { MatIconModule } from "@angular/material/icon";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { TableComponent } from "../../../../components/table/table.component";
import {
  TableWithoutPaginationComponent
} from "../../../../components/table-without-pagination/table-without-pagination.component";
import { MatListModule } from "@angular/material/list";
import { ShowImageComponent } from "../../../../components/show-image/show-image.component";
import { MAT_AUTOCOMPLETE_DEFAULT_OPTIONS, MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { createBatchCargoPayload } from "../../../../models/Cargo";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { SuppliersService } from "../../../suppliers/services/suppliers.service";
import { PaginateDatasource } from "../../../../models/Table";
import { PartialSupplier, Supplier } from "../../../../models/Supplier";

export enum cargoType {
  CARICO = "CARICO",
  SCARICO = "SCARICO"
}

export const cargoTypeArray = [
  { name: "CARICO", value: cargoType.CARICO },
  { name: "SCARICO", value: cargoType.SCARICO }
];

export interface MoveProductList {
  productId: number
  product: Product | any,
  currentWarehouseId: number,
  currentWarehouse: Warehouse | any,
  currentSupplierId?: number,
  currentSupplier?: Supplier | any,
  quantityToMove: number,
  availableQuantity: number,
  type: cargoType,
  inserted: boolean,
}

export type PartialMoveProductList = Partial<MoveProductList>;

export const initialValues: MoveProductList = {
  productId: 0,
  product: "",
  currentWarehouseId: 0,
  currentWarehouse: "",
  currentSupplierId: 0,
  currentSupplier: "",
  quantityToMove: +1,
  availableQuantity: 0,
  type: cargoType.CARICO,
  inserted: false,
}

export const errorQuantity = {
  error: {
    reason: { message: "Non puoi scaricare più prodotti di quelli presenti nel magazzino" },
    statusCode: 400,
    statusText: 'Bad request'
  }
}

@Component({
  selector: 'app-bulk',
  standalone: true,
  imports: [ CommonModule, EditCargoComponent, SearchProductComponent, SearchWarehouseComponent, MatIconModule, FormsModule, MatOptionModule, MatSelectModule, ReactiveFormsModule, TableComponent, TableWithoutPaginationComponent, MatListModule, ShowImageComponent, MatAutocompleteModule, MatInputModule, MatProgressSpinnerModule ],
  providers: [
    { provide: MAT_AUTOCOMPLETE_DEFAULT_OPTIONS, useValue: { overlayPanelClass: 'panel-height' } }
  ],
  templateUrl: 'create-bulk-cargos.component.html',
  styles: [`
    .autocomplete {
      max-height: 350px !important;
    }
  `]
})
export default class CreateBulkCargosComponent implements OnInit, OnDestroy {
  fb = inject(FormBuilder);

  store: Store<AppState> = inject(Store);
  productsService = inject(ProductsService);
  suppliersService = inject(SuppliersService);

  defaultFilterOptions = { page: 1, limit: 30 };

  suppliers$ = this.suppliersService.loadSuppliers({ query: {}, options: this.defaultFilterOptions })
    .pipe(map((res: PaginateDatasource<Supplier>) => res.docs));

  subject = new Subject();
  resetProductFormSubject: Subject<boolean> = new Subject<boolean>();
  resetWarehouseFormSubject: Subject<boolean> = new Subject<boolean>();

  currentSupplierId: number = 0;


  cargoForm = this.fb.group({
    cargo: this.fb.array([this.fb.group({
      productId: this.fb.nonNullable.control(initialValues.productId, [ Validators.required, Validators.min(1) ]),
      product: this.fb.nonNullable.control(initialValues.product, [ Validators.required ]),
      currentWarehouseId: this.fb.nonNullable.control(initialValues.currentWarehouseId, [ Validators.required, Validators.min(1) ]),
      currentWarehouse: this.fb.nonNullable.control(initialValues.currentWarehouse, Validators.required),
      currentSupplierId: this.fb.nonNullable.control(initialValues.currentSupplierId, [ Validators.required ]),
      currentSupplier: this.fb.nonNullable.control(initialValues.currentSupplier, [ Validators.required ]),
      quantityToMove: this.fb.nonNullable.control(initialValues.quantityToMove),
      availableQuantity: this.fb.nonNullable.control(initialValues.availableQuantity, Validators.required),
      type: this.fb.nonNullable.control(initialValues.type, Validators.required),
      inserted: this.fb.nonNullable.control(initialValues.inserted, Validators.required)
    })])
  });
  /* For keeping track of the form in edit mode */
  indexSelected: number = -1

  /* For removing old form and creating the new one */
  isVisible$ = new BehaviorSubject(true);

  shouldOpenPanel = false;

  get cargos() {
    return this.cargoForm.controls.cargo;
  }

  constructor() {
    this.cargos.valueChanges.pipe(
      debounceTime(200),
    ).
    subscribe(
      res => {
        const textOrSupplier = res.slice(-1)[0].currentSupplier;
        if((textOrSupplier as Supplier | null)?.id) {
          return;
        }
        this.suppliers$ = this.suppliersService.loadSuppliers({ query: {
            value: textOrSupplier || ""
          }, options: this.defaultFilterOptions }).pipe(map((res: PaginateDatasource<Supplier>) => res.docs));
      }
    )

  }

  ngOnInit() {
    this.indexSelected = 0;
    this.listenToChanges();
    // this.store.select(getCargosHttpError).pipe(
    //     takeUntil(this.subject)
    // ).subscribe(res => {
    //     if (res && !Object.values(res).length) {
    //         // Resetta il form ogni volta che un l'errore viene settato su undefined
    //         if (this.indexSelected === -1)
    //             this.resetFormData(0)
    //         else
    //             this.resetFormData(this.indexSelected);
    //     }
    // });
  }

  listenToChanges() {
    /* Update the state with new values from cargoForm*/
    this.cargos.valueChanges.pipe(
      pairwise(),
      map(([ _, newState ]) => {
        return createBatchCargoPayload(newState as MoveProductList[]);
      }),
      map((changes) => {
        return !this.cargos.invalid || this.cargos.length > 0 ? changes : []
      }),
      takeUntil(this.subject),
    ).subscribe(changes => {
      /* Remove the last form (still invalid) */
      changes.pop();
      this.store.dispatch(CargoActions.batchCargoActiveChanges({ changes }))
    });


    /* Add listeners to every control inside the cargoForm array*/
    merge(...this.cargos.controls.map((control: AbstractControl, index: number) =>
      control.valueChanges.pipe(
        startWith(initialValues),
        debounceTime(200),
        pairwise(),
        map(([ old, newer ]) => (
          [
            { rowIndex: index, control, value: old },
            { rowIndex: index, control, value: newer }
          ]
        )),
        takeUntil(this.subject)
      )))
      .subscribe(([ old, changes ]) => {
        /* Every time a property inside the form changes, check if the product can be inserted or not */
        this.checkInsertion(old, changes);
      });

    /* If warehouse and product is chosen, ask the server for the quantity available inside the warehouse */
    combineLatest([
      this.getGroup(this.indexSelected).controls.currentWarehouseId.valueChanges.pipe(startWith("")),
      this.getGroup(this.indexSelected).controls.productId.valueChanges.pipe(startWith(""))
    ]).pipe(
      concatMap(([ currentWarehouseId, productId ]) => {
        const value = this.getGroup(this.indexSelected).getRawValue()
        if ((!currentWarehouseId && !value.currentWarehouseId) || (!productId && !value.productId)) {
          return of(undefined);
        }
        return this.productsService.getProductQuantityRemain(productId as string || String(value.productId), currentWarehouseId as string || String(value.currentWarehouseId));
      }),
      takeUntil(this.subject),
    ).subscribe((res) => {
      if (!res) {
        return;
      }
      this.getGroup(this.indexSelected).patchValue({ availableQuantity: res.quantity });
    });
  }

  checkInsertion(old: { value: MoveProductList, rowIndex: number }, changes: {
    value: MoveProductList,
    rowIndex: number
  }) {
    if (this.getGroup(changes.rowIndex).invalid) {
      return;
    }
    /* If productId, currentWarehouseId and type are setted check if the change is possible */
    if (changes.value.productId !== 0 && changes.value.currentWarehouseId !== 0 && changes.value.type) {
      this.addOrUpdateProduct(changes.rowIndex, changes.value as MoveProductList, old.value as MoveProductList);
      this.destroyAndReload(!changes.value.inserted);
    }
  }

  onSelectionProductChange(evt: any, index: number) {
    const pr = evt.option.value as Product | any;
    this.setProduct(pr, index);
  }

  setProduct(product: PartialProduct | any, index: number) {
    this.cargos.controls[index].patchValue({ productId: product.id });
  }

  onSelectionCurrentWarehouseChange(evt: any, index: number) {
    const wh = evt.option.value as Warehouse | any;
    this.setCurrentWarehouse(wh, index);
  }

  setCurrentWarehouse(warehouse: PartialWarehouse | any, index: number) {
    this.cargos.controls[index].patchValue({ currentWarehouseId: warehouse.id });
  }

  displaySupplier(supplier: PartialSupplier): string {
    return supplier?.name ?? "";
  }

  onSupplierSelect(event: any, index: number) {
    const supplier = event.option.value as Supplier | any;
    this.currentSupplierId = supplier.id;

    this.setCurrentSupplier(supplier, index);
  }

  setCurrentSupplier(supplier: PartialSupplier | any, index: number) {
    this.cargos.controls[index].patchValue({ currentSupplierId: supplier.id });
  }

  add(index: number) {
    const cargoControl = this.getGroup(index);
    const cargo = cargoControl.getRawValue();
    if (cargo.availableQuantity - cargo.quantityToMove > 0 || cargo.type === cargoType.CARICO) {
      const newCargo = cargo;
      ++newCargo.quantityToMove;
      this.updateProduct(index, newCargo, this.indexSelected+1, cargo);

      // cargoControl.patchValue({ quantityToMove: ++cargo.quantityToMove });
    } else {
      this.store.dispatch(CargoActions.batchCargoFailed(errorQuantity))
    }
  }

   removeProduct(index: number) {
    const productFormArray = this.cargoForm.get('cargo')?.value;
    productFormArray?.splice(index, 1);
    const changes = createBatchCargoPayload(productFormArray as MoveProductList[]);
    changes.pop();
    this.store.dispatch(CargoActions.batchCargoActiveChanges({ changes }))

    this.subject.next(true);
    this.cargos.removeAt(index);
    this.indexSelected -= 1;
    this.getGroup(this.indexSelected).patchValue({
      product: initialValues.product,
      productId: initialValues.product
    })
    this.listenToChanges();
  }

  remove(index: number) {
    const cargoControl = this.getGroup(index);
    const cargo = cargoControl.getRawValue();

    const newCargo = cargo;
    if (newCargo.quantityToMove > 1) {
      this.updateProduct(index, newCargo, this.indexSelected+1, cargo);
      cargoControl.patchValue({ quantityToMove: --cargo.quantityToMove });
    }
  }

  addOrUpdateProduct(rowIndex: number, product: MoveProductList, oldValue: MoveProductList) {
    const existingProductIndex = this.cargos.getRawValue().findIndex(
      (item: MoveProductList) => item.productId === product.productId && item.currentWarehouseId === product.currentWarehouseId
    );
    if (existingProductIndex !== -1 && existingProductIndex !== this.indexSelected) {
      this.updateProduct(existingProductIndex, product, rowIndex, oldValue)
    } else {
      this.newProduct(rowIndex);
    }
    this.subject.next(true);
    this.listenToChanges();
  }

  updateProduct(existingProductIndex: number, editedProduct: MoveProductList, rowIndex: number, oldValue: MoveProductList) {
    // If the product exists, update its quantityToMove based on its type
    const existingProduct = this.getGroup(existingProductIndex).getRawValue();
    const isOldAdd = existingProduct.type === cargoType.CARICO;
    const isCurrentAdd = editedProduct.type === cargoType.CARICO;

    // Update quantityToMove based on the type of the existing and incoming product
    const toAdd = isCurrentAdd ? editedProduct.quantityToMove : -editedProduct.quantityToMove;
    const before = isOldAdd ? existingProduct.quantityToMove : -existingProduct.quantityToMove;

    if (!editedProduct.inserted)
      editedProduct.quantityToMove = before + toAdd;
    else
      editedProduct.quantityToMove = toAdd;

    // Adjust type based on the updated quantityToMove
    editedProduct.type = editedProduct.quantityToMove < 0 ? cargoType.SCARICO : cargoType.CARICO;

    // Convert quantityToMove to a positive number
    editedProduct.quantityToMove = Math.abs(editedProduct.quantityToMove);

    // Remove product if quantityToMove becomes zero
    if (editedProduct.quantityToMove === 0) {
      this.cargos.removeAt(existingProductIndex);
      this.indexSelected -= 1;
      this.getGroup(rowIndex - 1).patchValue({
        product: initialValues.product,
        productId: initialValues.product
      })
    } else {
      if (existingProduct.type === cargoType.SCARICO && existingProduct.quantityToMove > existingProduct.availableQuantity) {
        this.store.dispatch(CargoActions.batchCargoFailed(errorQuantity))

        this.getGroup(existingProductIndex).patchValue({
          quantityToMove: oldValue.quantityToMove || 1,
          type: oldValue.type || cargoType.SCARICO
        })
      }

      this.cargos.at(this.indexSelected).patchValue({
        product: initialValues.product,
        productId: initialValues.product
      })
      this.cargos.controls[existingProductIndex].patchValue({
        quantityToMove: editedProduct.quantityToMove,
        type: editedProduct.type
      });
    }
  }

  newProduct(rowIndex: number) {
    /* Take the value of the inserted cargo, needed to remember the type and warehouse */
    const currentControl = this.getGroup(rowIndex);
    const current = currentControl.getRawValue() as MoveProductList;
    const cargoNew = this.fb.group({
      productId: this.fb.nonNullable.control(initialValues.productId, [ Validators.required, Validators.min(1) ]),
      product: this.fb.nonNullable.control(initialValues.product, [ Validators.required ]),
      currentWarehouseId: this.fb.nonNullable.control(current.currentWarehouseId || initialValues.currentWarehouseId, [ Validators.required, Validators.min(1) ]),
      currentWarehouse: this.fb.nonNullable.control(current?.currentWarehouse || initialValues.currentWarehouse, Validators.required),
      currentSupplierId: this.fb.nonNullable.control(current.currentSupplierId || initialValues.currentSupplierId ),
      currentSupplier: this.fb.nonNullable.control(current?.currentSupplier || initialValues.currentSupplier ),
      quantityToMove: this.fb.nonNullable.control(initialValues.quantityToMove, [ Validators.required, Validators.min(1) ]),
      availableQuantity: this.fb.nonNullable.control(initialValues.availableQuantity, Validators.required),
      type: this.fb.nonNullable.control(current?.type || initialValues.type, Validators.required),
      inserted: this.fb.nonNullable.control(initialValues.inserted, Validators.required)
    });
    if (current.type === cargoType.SCARICO && current.quantityToMove > current.availableQuantity) {
      this.store.dispatch(CargoActions.batchCargoFailed(errorQuantity))
      currentControl.patchValue({ product: initialValues.product, productId: initialValues.productId });
    } else {
      this.cargos.push(cargoNew);
      currentControl.patchValue({ inserted: true })
      this.indexSelected += 1;
    }
  }

  /* Utils methods */
  getGroup(index: number) {
    return this.cargos.at(index);
  }

  isNotString(value: any) {
    return typeof value !== "string";
  }

  destroyAndReload(shouldOpen: boolean) {
    this.shouldOpenPanel = shouldOpen;
    this.isVisible$.next(false);
    setTimeout(() => {
      this.isVisible$.next(true);
    }, 0);

  }

  ngOnDestroy() {
    this.cargoForm.reset();
    this.store.dispatch(CargoActions.clearBatchCargoActive());
    this.store.dispatch(CargoActions.clearCargoHttpError());
  }

  protected readonly cargoTypeArray = cargoTypeArray;
  protected readonly cargoType = cargoType;
}
