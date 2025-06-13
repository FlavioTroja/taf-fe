import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputComponent } from "../../../../components/input/input.component";
import { RouterModule } from "@angular/router";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import {
  selectCustomRouteParam, selectRouteQueryParamParam,
} from "../../../../core/router/store/router.selectors";
import * as ProductsAction from "src/app/pages/products/store/actions/products.actions";
import { MatIconModule } from "@angular/material/icon";
import { combineLatest, map, pairwise, startWith, Subject, takeUntil } from "rxjs";
import { getCurrentProduct } from "../../store/selectors/products.selectors";
import { ProductsOnCategories, createProductPayload, PartialProduct, Product } from "../../../../models/Product";
import { difference } from "../../../../../utils/utils";
import * as ProductActions from "src/app/pages/products/store/actions/products.actions";
import { WarehousesService } from "../../../warehouses/services/warehouses.service";
import { UnitMeasureService } from "../../../../services/unitMeasure.service";
import { CategoriesService } from "../../../categories/services/categories.service";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSelectModule } from "@angular/material/select";
import { UnitMeasure } from "../../../../models/UnitMeasure";
import { FileUploadComponent } from "../../../../components/upload-image/file-upload.component";
import { SizeListComponent } from "./components/size-list/size-list.component";
import { AttachmentsComponent } from "../../../../components/attachments/attachments.component";
import { MatDialogModule } from "@angular/material/dialog";

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [ CommonModule, RouterModule, InputComponent, MatIconModule, FormsModule, ReactiveFormsModule, FileUploadComponent, MatAutocompleteModule, MatSelectModule, SizeListComponent, AttachmentsComponent, MatDialogModule ],
  templateUrl: `edit-product.component.html`,
  styles: [`
    .image-div{}

    div.image-div .on-hover-images{
      visibility: hidden;
    }

    div.image-div:hover .on-hover-images{
      visibility: visible;
    }

    mat-icon.delete {
      font-size: 4em;
      width: auto;
      height: auto;
    }

    .attachment-box:hover .layer {
      display: flex;
    }

    .bigger-icon {
      transform: scale(3);
    }

    .bg-white-trasparent {
      background-color: rgba(255, 255, 255, 0.5);
    }
  `]
})
export default class EditProductComponent implements OnInit, OnDestroy {

  store: Store<AppState> = inject(Store);
  subject = new Subject();
  active$ = this.store.select(getCurrentProduct)
    .pipe(takeUntilDestroyed());
  warehouseService = inject(WarehousesService);
  unitMeasureService = inject(UnitMeasureService);
  categoryService = inject(CategoriesService);

  fb = inject(FormBuilder);

  id = toSignal(this.store.select(selectCustomRouteParam("id")));
  queryParams = toSignal(this.store.select(selectRouteQueryParamParam()));
  populateParam = "warehouses warehouses.warehouse warehouseUm um categories";

  productForm = this.fb.group({
    name: ["", Validators.required],
    sku: [""],
    ean: [""],
    note: [""],
    description: [""],
    image: [""],
    gallery: this.fb.array([]),
    yellowThreshold: [""],
    redThreshold: [""],
    size: this.fb.group({
      width: [false],
      height: [false],
      length: [false],
      string: [''],
      integer: [true],
      float: [false],
    }),
    weight: [],
    umId: [],
    um: [""],
    sellingPrice: [''],
    vat: [22, Validators.required],
    total: [0],
    buyingPrice: this.fb.group({
      quantity: [0, Validators.required],
      price: [0, Validators.required],
      vat: [22, Validators.required]
    }),
    warehouse: this.fb.group({
      warehouseId: [-1],
      quantity: [0]
    }),
    warehouseUmId: [1, Validators.required],

    categories: [[0]]
  });

  initFormValue: PartialProduct = {};
  productsOnCategories: ProductsOnCategories[] = [];

  defaultFilterOptions = { page: 1, limit: 30 };

  warehouses$ = this.warehouseService.loadWarehouses({ query: {}, options: this.defaultFilterOptions }).pipe(
    map(res => res.docs)
  );

  unitMeasuresForProduct: UnitMeasure[] = [];
  unitMeasuresForWarehouse: UnitMeasure[] = [];

  categoriesList: { categoryId: number, name: string }[] = [];

  totalPrice: number = 0;

  isImageHover: boolean = false;

  get f() {
    return this.productForm.controls;
  }

  get size(): FormGroup {
    return this.productForm.get('size') as FormGroup;
  }

  get um(): any {
    return this.f.um.value;
  }

  get isNewProduct() {
    return this.id() === "new";
  }

  // Return product id from "productId" queryParams
  get getCopyId(): number | undefined {
    return this.queryParams() ? this.queryParams()!['productId'] : undefined;
  }

  constructor() {

    this.unitMeasureService.loadAllUnitMeasures({ ...(!!this.f.um.value ? { value: this.f.um.value } : {}) })
      .subscribe(res => {
        this.unitMeasuresForProduct = res.filter(um => um.isForProduct) ?? []
        this.unitMeasuresForWarehouse = res.filter(um => um.isForWarehouse) ?? []
      });

    this.f.um.valueChanges.subscribe(() => {
        let um = this.f.um.value;

        if (typeof um !== 'string') {
          return;
        }

    });

    this.f.buyingPrice.get("quantity")?.valueChanges.pipe(
      takeUntil(this.subject)
    ).subscribe(quantity => {
      if(!quantity) {
        return;
      }

      this.f.warehouse.get("quantity")?.setValue(+quantity);
    })

    this.categoryService.loadAllCategories({ query: { isLeaf: true }, options: {} }).pipe(
      map(res => res.map(c => ({ categoryId: c.id, name: c.name }))),
      takeUntil(this.subject)
    ).subscribe(res => {
      this.categoriesList = res;
    });

  }

  ngOnInit() {
    if(!this.isNewProduct || this.getCopyId) {
      this.store.dispatch(
        ProductsAction.getProduct({ id: this.getCopyId ?? this.id(), params: { populate: this.populateParam } })
      );
    }

    this.active$
      .subscribe((value: any) => {
        if(!value) {
          return;
        }

        this.initializeGallery(value.gallery);

        if(this.getCopyId) {

          value = {
            ...value,
            name: `${value.name} COPIA`,
            sku: "",
            buyingPrices: []
          };

        }

        this.productForm.patchValue({
          ...value,
          buyingPrice: value.buyingPrices[0]
        });


        this.setUniteMeasure(value.um);

        this.loadCategories((value as Product).categories || []);

        this.initFormValue = !this.getCopyId ? this.productForm.value as PartialProduct : {};
      });

    this.editProductChanges();

    this.getTotalPrice();

  }

  editProductChanges() {
    this.productForm.valueChanges.pipe(
      pairwise(),
      map(([_, newState]) => {
        if(!Object.values(this.initFormValue).length && !this.isNewProduct) {
          return {};
        }


        const diff = {
          ...difference(this.initFormValue, newState),

          // Array data
          gallery: newState.gallery,
          categories: newState.categories
        };

        return createProductPayload(diff, this.productsOnCategories);
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.productForm.invalid ? { ...changes, id: +this.id() } : {}),
      takeUntil(this.subject),
      // tap(changes => console.log(changes)),
    ).subscribe(changes => this.store.dispatch(ProductActions.productActiveChanges({ changes })));
  }

  get gallery(): FormArray {
    return this.productForm.get("gallery") as FormArray;
  }


  setUniteMeasure(um: UnitMeasure | any): void {
    if(!um) {
      return
    }

    this.productForm.patchValue({ umId: um.id, um });
  }

  changeUniteMeasure(umId: number) {

    this.size.patchValue({
      float: '',
      width: '',
      height: '',
      length: '',
      string: '',
      integer: ''
    });
    this.unitMeasureService.getUnitMeasure(umId).pipe(
     takeUntil(this.subject)
    ).subscribe(um => this.setUniteMeasure(um));
  }

  initializeGallery(images: string[]): void {
    this.gallery.clear();

    images.forEach(_ => this.gallery.push(
      this.fb.control("")
    ));
  }

  onUploadMainImage(images: string[]) {
    this.productForm.patchValue({
      image: images[0]
    });
  }
  onUploadGalleryImages(images: string[]) {
    this.initializeGallery(images);
    this.productForm.patchValue({
      gallery: images
    });
  }

  loadCategories(categories: ProductsOnCategories[]) {
    this.productsOnCategories = categories;

    this.productForm.patchValue({
      categories: categories.map(({ categoryId }: ProductsOnCategories) => categoryId)
    });
  }

  getTotalPrice() {
    combineLatest([
      this.productForm.get("sellingPrice")!.valueChanges.pipe(startWith("")),
      this.productForm.get("vat")!.valueChanges.pipe(startWith(""))
    ]).subscribe(([ sellingPrice, vat ]) => {
      if(!sellingPrice) {
        this.totalPrice = 0;
        return;
      }
      const taxable = +sellingPrice ?? 0;
      vat = !vat ? 22 : +vat;

      this.totalPrice = taxable! + ( (taxable * vat) /100 );

    });
  }

  onDeleteMainImage() {
    this.productForm.patchValue({
      image: ""
    });
  }

  deleteImage(i: number): void {
    this.gallery.removeAt(i);
  }

  get getGalleryObjectList() {
    const images = this.f.gallery.value;

    return images.map(url => {
      const arr = (url as string).split(".");
      return {
        value: url,
        type: arr[arr.length - 1],
        name: arr[arr.length - 2] + arr[arr.length - 1]
      };
    });
  }

  get getCurrentGallery(): string[] {
    return this.f.gallery.value as string[] || [];
  }

  ngOnDestroy(): void {
    this.productForm.reset();

    this.store.dispatch(ProductActions.clearProductHttpError());
    this.store.dispatch(ProductActions.clearProductActive());
  }

}
