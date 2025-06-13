import {
  AfterViewInit,
  ChangeDetectorRef,
  Component, EventEmitter, Inject,
  inject, Output,
  TemplateRef,
  ViewChild
} from "@angular/core";
import {MatIconModule} from "@angular/material/icon";
import {PathButtonComponent} from "./path-button.component";
import {FormBuilder, FormControl, ReactiveFormsModule} from "@angular/forms";
import {Dialog, StagedModalComponent} from "src/app/components/stagedModal/staged-modal.component";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {CategoriesService} from "src/app/pages/categories/services/categories.service";
import {Category} from "../../../../../../models/Category";
import {Store} from "@ngrx/store";
import {AppState} from "../../../../../../app.config";
import {getCostsChanges, getCurrentCost} from "../../../../store/selectors/drafts.selectors";
import {ResourceCostFormComponent} from "./resource-cost-form.component";
import {Observable, Subject} from "rxjs";
import {debounceTime, distinctUntilChanged, map, takeUntil} from "rxjs/operators";
import {Cost} from "src/app/models/Setup";
import {ResourceProductFormComponent} from "./resource-product-form.component";
import {Product} from "../../../../../../models/Product";
import {ProductsService} from "../../../../../products/services/products.service";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {InputComponent} from "../../../../../../components/input/input.component";
import * as DraftsActions from "../../../../store/actions/drafts.actions";
import {preventInvalidCharactersForNumericTextInput} from "../../../../../../../utils/utils";
import {SearchComponent} from "../../../../../../components/search/search.component";

export type ProductWithQuantity = Product & { quantity: number };

@Component({
  selector: 'app-draft-cost-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, StagedModalComponent, PathButtonComponent, ReactiveFormsModule, ResourceCostFormComponent, ResourceProductFormComponent, NgOptimizedImage, SearchComponent],
  template: `
    <div class="p-2.5 flex flex-col gap-2.5 justify-between w-[40rem]">
      <app-staged-modal #stagedModalTemplate [dialogPath]="dialogs ?? []"/>
    </div>

    <ng-template #indexTemplate>
      <div class="flex gap-2">
        <app-path-button class="w-full" [title]="'Prodotto'"
                         (click)="stagedModal.goToDialogById('addProductHome')"
        />

        <app-path-button class="w-full" [title]="'Risorsa'"
                         (click)="stagedModal.goToDialogById('addNewResource')"
        />
      </div>
    </ng-template>

    <ng-template #addProductHomeTemplate>
      <div class="flex gap-2">
        <app-path-button class="w-full" [title]="'Magazzino'"
                         (click)="stagedModal.goToDialogById('selectParentProductCategory')"
        />

        <app-path-button class="w-full" [title]="'Nuovo'"
                         (click)="stagedModal.goToDialogById('addNewProduct')"
        />
      </div>
    </ng-template>

    <ng-template #selectParentProductCategoryTemplate>
      <div class="flex max-h-72 flex-col gap-2 overflow-y-auto">
        <button class="w-full bg-cover bg-no-repeat bg-center select-none rounded-md shadow-sm"
                *ngFor="let category of rootCategories$ | async"
                [style.background-image]="'url('+getImage(category)+')'"
                (click)="onCategoryClick(category)">
          <div
            class="h-24 rounded-md flex justify-center items-center text-xl text-white bg-gradient-to-t from-[#000000b3] to-transparent">
            {{ category.name }}
          </div>
        </button>
      </div>
    </ng-template>

    <ng-template #selectIntermediateProductCategoryTemplate>
      <div class="flex h-[40rem] flex-col gap-2 overflow-y-auto">
        <button class="w-full flex items-center p-2 gap-2 bg-foreground select-none rounded-md shadow-md"
                *ngFor="let category of intermediateCategories$ | async"
                (click)="onCategoryClick(category)">

          <img class="rounded-md" height="44" width="44" [ngSrc]="getImage(category)">

          <div>{{ category.name }}</div>
        </button>
      </div>
    </ng-template>

    <!--    <ng-template #selectProductTemplate>-->
    <!--      <div class="flex h-[30rem] flex-col gap-2 overflow-y-auto">-->
    <!--        <button class="w-full flex items-start p-2.5 gap-2 bg-foreground select-none rounded-md shadow-md"-->
    <!--                *ngFor="let product of products$ | async">-->
    <!--          <img class="rounded-md shadow-md" height="44" width="44"-->
    <!--               [ngSrc]="getImage(product)">-->

    <!--          <div class="flex flex-col items-start">-->
    <!--            <div class="text-sm">{{ product.name }}</div>-->
    <!--            <div class="description-container rounded-md p-1 text-xs text-left" *ngIf="product.description">{{ product.description.length < 100 ?-->
    <!--              product.description : product.description.substring(0, 100)+"..." }}</div>-->
    <!--          </div>-->
    <!--        </button>-->
    <!--      </div>-->
    <!--    </ng-template>-->

    <!--  Da rivedere, è una pezza  -->
    <ng-template #selectProductTemplate>
      <div class="flex h-[30rem] flex-col gap-2 overflow-y-auto">
        <app-search [search]="search"/>
        <button
          class="w-full flex items-start justify-between p-2.5 gap-2 bg-foreground select-none rounded-md shadow-md"
          *ngFor="let product of products$ | async">
          <div class="flex gap-1">
            <img class="rounded-md shadow-md" height="44" width="44"
                 [ngSrc]="getImage(product)">

            <div class="flex flex-col items-start">
              <div class="text-sm">{{ product.name }}</div>
              <div class="text-sm px-1 bg-light-gray rounded-md" *ngIf="product.sellingPrice">Prezzo di
                vendita: {{ product.sellingPrice | currency: 'EUR' }}
              </div>
              <div class="description-container rounded-md text-xs text-left" *ngIf="product.description">{{
                  product.description.length < 100 ?
                    product.description : product.description.substring(0, 100) + "..."
                }}
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-1 h-full">
            <div class="relative w-48 h-full">
              <input
                #productQuantity
                class="bg-foreground default-shadow w-48 rounded-md outline-none px-1 h-full"
                type="number"
                placeholder="quantità"
                min="1"
                step="1"
                [value]="getCurrentProductSelectedQuantity(product)"
                (keydown)="preventInvalidCharactersForNumericTextInput($event, false, false)"
                (input)="onQuantityChange(product, $event)"
              >
              <span class="absolute right-1 top-3 font-bold pl-0.1">
                {{ product.warehouseUm?.name }}
              </span>
            </div>
          </div>
        </button>
      </div>
    </ng-template>

    <ng-template #addNewProductTemplate>
      <app-resource-cost-form/>
    </ng-template>

    <ng-template #newCostTotalTemplate>
      <div *ngIf="activeCostTotal | async as total">(€{{ total }})</div>
    </ng-template>

    <ng-template #addNewResourceTemplate let-form="form" let-controls="controls">
      <app-resource-product-form/>
    </ng-template>
  `,
  styles: [``]
})

export class DraftCostModalComponent implements AfterViewInit {
  @ViewChild("indexTemplate") indexTemplate!: TemplateRef<any>;
  @ViewChild("addResourceHomeTemplate") addResourceHomeTemplate!: TemplateRef<any>;
  @ViewChild("addProductHomeTemplate") addProductHomeTemplate!: TemplateRef<any>;
  @ViewChild("selectParentProductCategoryTemplate") selectParentProductCategoryTemplate!: TemplateRef<any>;
  @ViewChild("selectIntermediateProductCategoryTemplate") selectIntermediateProductCategoryTemplate!: TemplateRef<any>;
  @ViewChild("addNewResourceTemplate") addNewResourceTemplate!: TemplateRef<any>;
  @ViewChild("addNewProductTemplate") addNewProductTemplate!: TemplateRef<any>;
  @ViewChild("selectProductTemplate") selectProductTemplate!: TemplateRef<any>;
  @ViewChild("newCostTotalTemplate") newCostTotalTemplate!: TemplateRef<any>;

  @ViewChild("stagedModalTemplate") stagedModal!: StagedModalComponent;

  @Output() emitProduct = new EventEmitter<ProductWithQuantity>();

  store: Store<AppState> = inject(Store);
  categoriesService = inject(CategoriesService);
  productsService = inject(ProductsService);
  fb = inject(FormBuilder);
  subject = new Subject();

  search = new FormControl("");
  selectedProductCategoryId: number | null = null;

  activeCostTotal = this.store.select(getCurrentCost)
    .pipe(map(value => {
      return Object.keys(value).length ? (value as Cost).price.toFixed(2) : undefined;
    }));
  rootCategories$ = this.categoriesService.loadAllCategories({
    query: {parentCategoryId: null},
    options: {populate: "children"}
  });
  intermediateCategories$?: Observable<Category[]>;
  products$?: Observable<Product[]>;
  dialogs?: Dialog[] = undefined;

  constructor(
    private cdRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { onClose: (isSuccessful: boolean) => void },
  ) {
  }

  ngAfterViewInit(): void {
    this.dialogs = [
      {id: "index", title: "Aggiungi costo", templateContent: this.indexTemplate},
      {
        id: "addResourceHome",
        title: "Aggiungi risorsa",
        previousDialog: "index",
        templateContent: this.addResourceHomeTemplate
      },
      {
        id: "addProductHome",
        title: "Aggiungi prodotto",
        previousDialog: "index",
        templateContent: this.addProductHomeTemplate
      },
      {
        id: "addNewResource",
        buttons: [
          {
            label: "Aggiungi",
            iconName: "add",
            selectors: {disabled: getCostsChanges},
            bgColor: "confirm",
            extraContent: this.newCostTotalTemplate,
            onClick: () => this.data.onClose(true)
          }
        ],
        title: "Aggiungi una risorsa",
        previousDialog: "index",
        templateContent: this.addNewProductTemplate,
      },
      {
        id: "selectParentProductCategory",
        title: "Seleziona categoria prodotto",
        previousDialog: "addProductHome",
        templateContent: this.selectParentProductCategoryTemplate
      },
      {
        id: "selectIntermediateProductCategory",
        title: "Seleziona categoria prodotto",
        previousDialog: "selectParentProductCategory",
        templateContent: this.selectIntermediateProductCategoryTemplate
      },
      {
        id: "selectProduct",
        title: "Seleziona prodotto",
        previousDialog: "selectIntermediateProductCategory",
        templateContent: this.selectProductTemplate,
        buttons: [
          {
            label: "Conferma",
            iconName: "check",
            bgColor: "confirm",
            onClick: () => this.addProducts()
          }
        ],
      },
      {
        id: "addNewProduct",
        buttons: [
          {
            label: "Aggiungi",
            iconName: "add",
            selectors: {disabled: getCostsChanges},
            bgColor: "confirm",
            onClick: () => this.data.onClose(true)
          }
        ],
        title: "Aggiungi un prodotto nuovo",
        previousDialog: "addProductHome",
        templateContent: this.addNewResourceTemplate,
      },
    ];

    this.cdRef.detectChanges();

    this.search.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.subject)
    ).subscribe(searchTerm => {
      this.searchProducts(searchTerm);
    });
  }


  getImage(item: Category | Product) {
    return !!item?.image ?
      item?.image : `https://eu.ui-avatars.com/api/?name=${item.name.slice(0, 2)}&size=112`;
  }

  onCategoryClick(category: Category) {
    this.selectedProductCategoryId = category.id;
    if (!category.children?.length) {
      // change into all
      this.products$ = this.productsService
        .loadAllProducts({
          query: {categories: [category.id]}, options: {
            populate: "warehouseUm"
          }
        })
        .pipe(map((val) => val.docs));

      this.stagedModal.goToDialogById("selectProduct");

      return;
    }

    this.intermediateCategories$ = this.categoriesService.loadAllCategories({
      query: {parentCategoryId: category.id},
      options: {populate: "children"}
    });

    if (!category.parentCategoryId) {
      this.stagedModal.goToDialogById("selectIntermediateProductCategory");
    }
  }


  products: ProductWithQuantity[] = [];

  getCurrentProductSelectedQuantity(product: Product) {
    return this.products.find(p => p.id === product.id)?.quantity ?? "";
  }

  onQuantityChange(product: Product, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = parseInt(inputElement.value, 10);

    if (!isNaN(value) && value > 0) {
      const existingProduct = this.products.find((p) => p.id === product.id);
      if (existingProduct) {
        existingProduct.quantity = value;
      } else {
        this.products.push({...product, quantity: value});
      }
    } else {
      this.products = this.products.filter((p) => p.id !== product.id);
    }
  }

  addProducts() {
    this.store.dispatch(DraftsActions.editCostsActiveChanges({
        changes: this.products.map(product => {
          return {
            id: -1,
            unitOfMeasure: "pz",
            price: +product.sellingPrice,
            quantity: +product.quantity,
            description: product.name,
            productId: product.id,
            product: product
          }
        })
      }
    ));
    this.data.onClose(true)
  }

  searchProducts(searchTerm: string | null) {
    if (this.selectedProductCategoryId) {
      this.products$ = this.productsService
        .loadAllProducts({
          query: {categories: [this.selectedProductCategoryId], value: searchTerm ?? ""}, options: {
            populate: "warehouseUm"
          }
        })
        .pipe(map((val) => val.docs));
    }
  }

  protected readonly preventInvalidCharactersForNumericTextInput = preventInvalidCharactersForNumericTextInput;
}
