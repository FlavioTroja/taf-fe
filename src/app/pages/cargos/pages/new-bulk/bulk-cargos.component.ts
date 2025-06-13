import { Component, inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { cargoType, cargoTypeArray, PartialMoveProductList } from "../bulk/create-bulk-cargos.component";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { AsyncPipe, JsonPipe, NgClass, NgForOf, NgIf } from "@angular/common";
import { MatAutocomplete, MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { MatOptionModule } from "@angular/material/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { SearchProductComponent } from "../edit/components/search-product/search-product.component";
import { SearchWarehouseComponent } from "../edit/components/search-warehouse/search-warehouse.component";
import { ProductsService } from "../../../products/services/products.service";
import { SuppliersService } from "../../../suppliers/services/suppliers.service";
import { WarehousesService } from "../../../warehouses/services/warehouses.service";
import { map, of, Subject, takeUntil } from "rxjs";
import { PaginateDatasource } from "../../../../models/Table";
import { PartialSupplier, Supplier } from "../../../../models/Supplier";
import { PartialWarehouse, Warehouse } from "../../../../models/Warehouse";
import { debounceTime, pairwise } from "rxjs/operators";
import { PartialProduct, Product, WarehousesList } from "../../../../models/Product";
import { difference, generateRandomCode } from "../../../../../utils/utils";
import { BatchCargo, BatchCargoSection, createBulkMoveProductPayload } from "../../../../models/Cargo";
import * as CargoActions from "../../store/actions/cargos.actions";
import { MatIconModule } from "@angular/material/icon";
import { ShowImageComponent } from "../../../../components/show-image/show-image.component";
import { getCargoBulkItems } from "../../store/selectors/cargos.selectors";
import { MessageContainerComponent } from "../../../../components/message-container/message-container.component";


@Component({
  selector: 'app-edit-cargo',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    SearchProductComponent,
    SearchWarehouseComponent,
    MatIconModule,
    ShowImageComponent,
    JsonPipe,
    NgClass,
    MessageContainerComponent
  ],
  template: `
    <div class="flex flex-col gap-3">
      <div class="text-2xl font-extrabold">NUOVA MOVIMENTAZIONE</div>

      <form [formGroup]="cargoForm">
        <div class="flex flex-wrap -mx-1">
          <div class="flex flex-col w-full lg:w-1/2 px-1">
            <div class="basis-1/3">
              <label class="text-md justify-left block px-3 py-0 font-medium">magazzino</label>
              <input
                type="text"
                class="focus:outline-none p-3 rounded-md w-full border-input"
                placeholder="Scegli il magazzino"
                matInput
                formControlName="warehouse"
                [matAutocomplete]="warehouseList"
              >
              <mat-autocomplete #warehouseList="matAutocomplete" [displayWith]="displayWarehouse">
                <mat-option *ngFor="let warehouse of (warehouses$ | async)" [value]="warehouse">
                  {{ warehouse.name }}
                </mat-option>
              </mat-autocomplete>
            </div>
          </div>

          <div class="flex flex-col w-full lg:w-1/2 px-1">
            <label class="text-md justify-left block px-3 py-0 font-medium">movimentazione</label>
            <mat-select
              [ngClass]="{'opacity-50 pointer-events-none': (items$ | async)?.length }"
              class="focus:outline-none p-3 border-input rounded-md w-full !font-bold bg-foreground"
              placeholder="Seleziona"
              formControlName="type">
              <mat-option *ngFor="let type of cargoTypeArray" [value]="type.value"> {{ type.name }}
              </mat-option>
            </mat-select>
          </div>
        </div>

        <div class="flex flex-wrap -mx-1">
          <div class="flex flex-col w-full lg:w-1/3 px-1">
            <label class="text-md justify-left block px-3 py-0 font-medium">prodotto</label>
            <input
              type="text"
              class="focus:outline-none p-3 rounded-md w-full border-input"
              placeholder="Scegli il prodotto"
              matInput
              formControlName="product"
              [matAutocomplete]="productList"
              [ngClass]="{'pointer-events-none opacity-50': !warehouse}"
            >
            <mat-autocomplete #productList="matAutocomplete" [displayWith]="displayProduct"
                              (optionSelected)="onProductSelect()">
              <mat-option *ngFor="let product of (products$ | async)" [value]="product">
                {{ product.name }}
              </mat-option>
            </mat-autocomplete>
          </div>

          <div class="w-full lg:w-1/3 px-1">
            <label class="text-md justify-left block px-3 py-0 font-medium">fornitore</label>
            <input
              [ngClass]="{'opacity-50 pointer-events-none': cargoForm.getRawValue().type === cargoType.SCARICO }"
              type="text"
              class="focus:outline-none p-3 rounded-md w-full border-input"
              placeholder="Scegli il fornitore"
              matInput
              formControlName="supplier"
              [matAutocomplete]="supplierList"
              (keydown.enter)="chooseSingleOptionSupplier()"
              (change)="onChangeSupplier()"
            >

            <mat-autocomplete #supplierList="matAutocomplete" [displayWith]="displaySupplier"
                              (optionSelected)="onSupplierSelect($event)"
                              (closed)="onSupplierPanelClose()">
              <mat-option *ngFor="let supplier of (suppliers$ | async)" [value]="supplier">
                {{ supplier.name }}
              </mat-option>
            </mat-autocomplete>
          </div>
        </div>
      </form>

      <div class="flex gap-3 justify-between items-center pt-3">
        <div *ngIf="products" class="text-2xl font-extrabold">
          MOVIMENTAZIONI SELEZIONATE
        </div>
        <div
        (click)="resetForm()"
        class="flex bg-foreground rounded-full p-2 shadow-md cursor-pointer font-bold"
        [ngClass]="{'opacity-50 pointer-events-none': !(items$ | async)?.length }"
        matTooltip="Elimina tutte le movimentazioni">
            <mat-icon class="material-symbols-rounded">delete</mat-icon>
        </div>
      </div>

      <div *ngFor="let product of items$ | async, index as i">
        <div class="bg-foreground default-shadow rounded-md p-2">
          <div class="flex flex-wrap justify-between gap-3">
            <div class="flex justify-start items-center space-x-3">
              <!--              <app-show-image classes="w-16 h-16" [imageUrl]="product.product?.image"-->
              <!--                              [objectName]="cargo.getRawValue().product.name"></app-show-image>-->
              <div>
                <div>{{ product.product?.name }}</div>
                <div>
                    <span class="bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-0.5 rounded">
                      {{ product.product?.id }} - {{ product.product?.ean }}
                      - {{ product.product?.sku }}
                    </span>
                </div>
              </div>
            </div>

            <div class="flex self-center gap-1">
                <div class="flex self-center gap-1" *ngIf="f.type.value === cargoType.CARICO">
                    <mat-icon class="icon-size material-symbols-rounded-filled rounded-md success">
                        add
                    </mat-icon>
                    <mat-icon class="text-sm material-symbols-rounded cursor-pointer blue">arrow_forward</mat-icon>
                </div>

                <span class="light-blu blue text-xs flex items-center px-3 h-7 rounded py-2">
                      <mat-icon class="icon-size material-symbols-rounded">warehouse</mat-icon>
                    {{ product.warehouse?.name }}
                  </span>

                <div class="flex self-center gap-1" *ngIf="f.type.value === cargoType.SCARICO">
                    <mat-icon class="text-sm material-symbols-rounded cursor-pointer blue">arrow_forward</mat-icon>
                    <mat-icon class="icon-size material-symbols-rounded-filled rounded-md error">
                        remove
                    </mat-icon>
                </div>
            </div>

            <div class="flex flex-row items-center">
                  <span class="light-blu blue text-xs flex items-center px-3 py-2 h-7 rounded">
                    <span class="font-semibold pr-2">
                      {{
                            f.type.value === cargoType.SCARICO ?
                                    getCurrentWarehouseQuantity(product?.product?.warehouses!) - +f.quantityToMove.value
                                    : getCurrentWarehouseQuantity(product?.product?.warehouses!) + +f.quantityToMove.value
                        }}
                    </span>

                    in

                    <mat-icon class="icon-size material-symbols-rounded blue">warehouse</mat-icon>
                      {{ f.warehouse.value.name }}
                  </span>
                <span>* dopo l'operazione</span>
            </div>

            <div class="flex justify-end items-center grow self-end space-x-3">
              <button class="flex items-center p-2 error rounded-lg shadow-md default-shadow-hover"
                      (click)="removeProduct(product.code)">
                <mat-icon class="align-to-center icon-size material-symbols-rounded">
                  delete
                </mat-icon>
              </button>

              <button class="flex items-center p-2 error rounded-lg shadow-md default-shadow-hover"
                      [disabled]="product.quantity < 1"
                      (click)="onStepperChangeQuantity(product.code, product.quantity, -1)">
                <mat-icon class="align-to-center icon-size material-symbols-rounded">
                  remove
                </mat-icon>
              </button>

              <input type="number" placeholder="quantità"
                     class="focus:outline-none p-3 rounded-md w-24 border-input text-center"
                     min="1" [value]="product.quantity" required
                     (change)="onChangeQuantity(product.code, $event)">

              <button class="success flex items-center p-2 error rounded-lg shadow-md default-shadow-hover"
                      (click)="onStepperChangeQuantity(product.code, product.quantity, 1)">
                <mat-icon class="align-to-center icon-size material-symbols-rounded">
                  add
                </mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export default class BulkCargosComponent implements OnInit{
  store: Store<AppState> = inject(Store);
  subject = new Subject();

  fb = inject(FormBuilder);

  productsService = inject(ProductsService);
  suppliersService = inject(SuppliersService);
  warehousesService = inject(WarehousesService);
  @ViewChild('supplierList') supplierMatAutocomplete!: MatAutocomplete;
  @ViewChild('ddtList') ddtMatAutocomplete!: MatAutocomplete;


  cargoForm = this.fb.group({
    product: this.fb.nonNullable.control("",  Validators.required ),
    warehouse: this.fb.nonNullable.control({} as Warehouse, Validators.required),
    supplier: this.fb.nonNullable.control(""),
    quantityToMove: this.fb.nonNullable.control(1),
    type: this.fb.nonNullable.control(cargoType.CARICO, Validators.required),
    products:this.fb.nonNullable.control([] as BatchCargo[]),
  });

  items$ = this.store.select(getCargoBulkItems) || of([]);

  initFormValue: PartialMoveProductList = {};
  defaultFilterOptions = { page: 1, limit: 30, populate: "" };
  productsFilterOptions = { page: 1, limit: 30, populate: "warehouses.warehouse" };
  supplierOptionSelected: boolean = false;

  warehouses$ = this.warehousesService.loadWarehouses({ query: {}, options: this.defaultFilterOptions })
    .pipe(map((res: PaginateDatasource<Warehouse>) => res.docs));

  suppliers$ = this.suppliersService.loadSuppliers({ query: {}, options: this.defaultFilterOptions })
    .pipe(map((res: PaginateDatasource<Supplier>) => res.docs));

  products$ = this.productsService.loadProducts({ query: {}, options: this.productsFilterOptions })
    .pipe(map((res: PaginateDatasource<Product>) => res.docs));


  get f() {
    return this.cargoForm.controls;
  }

  get products() {
    return this.f.products.value?.filter(o => Object.keys(o).length > 0) as BatchCargo[];
  }

  get warehouse() {
    return this.f.warehouse.value;
  }

  constructor() {
    this.f.warehouse.valueChanges.pipe(
      debounceTime(200),
      takeUntil(this.subject)
    ).subscribe((textOrWarehouse: any) => {
      if((textOrWarehouse as Warehouse | null)?.id) {
        return;
      }
      this.warehouses$ = this.warehousesService.loadWarehouses({ query: {
          value: textOrWarehouse || ""
        }, options: this.defaultFilterOptions }).pipe(map((res: PaginateDatasource<Warehouse>) => res.docs));
    });

    this.f.product.valueChanges.pipe(
      debounceTime(200),
      takeUntil(this.subject)
    ).subscribe((textOrProduct: any) => {
      if((textOrProduct as Product | null)?.id) {
        return;
      }
      this.products$ = this.productsService.loadProducts({ query: {
          value: textOrProduct || ""
        }, options: this.defaultFilterOptions }).pipe(map((res: PaginateDatasource<Product>) => res.docs));
    });

    this.f.supplier.valueChanges.pipe(
      debounceTime(200),
      takeUntil(this.subject)
    ).subscribe((textOrSupplier: any) => {
      if((textOrSupplier as Supplier | null)?.id) {
        return;
      }
      this.suppliers$ = this.suppliersService.loadSuppliers({ query: {
          value: textOrSupplier || ""
        }, options: this.defaultFilterOptions }).pipe(map((res: PaginateDatasource<Supplier>) => res.docs));
    });

  }

  ngOnInit() {
    this.editCargoChanges()
    this.store.dispatch(CargoActions.bulkCargoClearItems())
  }

  editCargoChanges() {
    this.cargoForm.valueChanges.pipe(
      pairwise(),
      map(([_, newState]) => {
        const diff = {
          ...difference(this.initFormValue, newState),
          items: [
            newState
          ],
        };
        return createBulkMoveProductPayload(diff);
      }),
      // map((changes: any) => Object.keys(changes).length !== 0 && !this.cargoForm.invalid ? { ...changes } : {}),
      takeUntil(this.subject),
    ).subscribe((changes: any) => {
      this.store.dispatch(CargoActions.bulkCargoActiveChanges({ changes }));
    });
  }

  onProductSelect() {
    const newProduct: BatchCargoSection = {
      code: generateRandomCode(),
      id: this.cargoForm.get('product')?.getRawValue().id,
      productId: this.cargoForm.get('product')?.getRawValue().id,
      product: this.cargoForm.get('product')?.getRawValue(),
      warehouseId: this.cargoForm.get('warehouse')?.getRawValue().id,
      warehouse: this.cargoForm.get('warehouse')?.getRawValue(),
      supplierId: this.cargoForm.get('supplier')?.getRawValue().id,
      quantity: this.cargoForm.getRawValue().quantityToMove,
    }

    this.store.dispatch(CargoActions.bulkCargoAddItem({ item: newProduct }));
    // Reset product
    this.f.product.reset();
  }

  removeProduct(code: string) {
    this.store.dispatch(CargoActions.bulkCargoRemoveItem({ code }));
  }

  onStepperChangeQuantity(code: string, currentQuantity: number, quantityToAdd: number) {
    this.cargoForm.patchValue({ quantityToMove: currentQuantity + quantityToAdd });
    this.store.dispatch(CargoActions.bulkCargoUpdateItemQuantity({ code, newQta: currentQuantity + quantityToAdd }));
  }

  onChangeQuantity(code: string, evt: any) {
    const newQuantity = +evt.target.value;

    this.store.dispatch(CargoActions.bulkCargoUpdateItemQuantity({ code, newQta: newQuantity }));
  }

  displayWarehouse(warehouse: PartialWarehouse): string {
    return warehouse?.name ?? "";
  }

  displayProduct(product: PartialProduct): string {
    return product?.name ?? "";
  }

  displaySupplier(supplier: PartialSupplier): string {
    return supplier?.name ?? "";
  }

  chooseSingleOptionSupplier(): void {
    const supplierOptions = this.supplierMatAutocomplete.options;
    if (supplierOptions.length == 1) {
      supplierOptions.first.select(); //already tried by passing true in the select(), the event doesn't trigger, still feels odd that works on ddt but not here
      this.cargoForm.controls.supplier.setValue(supplierOptions.first.value);
    }
  }

  onSupplierPanelClose(): void {
    if (!this.supplierOptionSelected) {
      this.chooseSingleOptionSupplier();
    }
  }

  onChangeSupplier(): void {
    this.supplierOptionSelected = false;
  }

  onSupplierSelect(event: any) {
    this.supplierOptionSelected = true;
  }




/*      this.cargoForm.controls.purchaseDdt.dirty
        && this.filteredPurchaseDdts.some((elem) => elem.fullCode === this.cargoForm.controls.purchaseDdt.getRawValue())
        && !this.ddtOptionSelected
        && this.ddtMatAutocomplete.options.length > 2
    */

  getCurrentWarehouseQuantity(warehouses: WarehousesList[]) {
    return warehouses?.find(w => w.warehouse?.name === this.cargoForm.getRawValue().warehouse?.name)?.quantity || 0;
  }

  resetForm() {
    this.store.dispatch(CargoActions.bulkCargoClearItems())
    this.cargoForm.reset()
  }

  protected readonly cargoTypeArray = cargoTypeArray;
  protected readonly cargoType = cargoType;
}
