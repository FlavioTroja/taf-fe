import {
  AfterViewInit,
  Component,
  effect,
  inject, OnInit,
  signal,
  TemplateRef,
  ViewChild, ViewEncapsulation,
  WritableSignal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from "../../../../components/search/search.component";
import { TableComponent } from "../../../../components/table/table.component";
import { TableSkeletonComponent } from "../../../../components/skeleton/table-skeleton.component";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { getProductsPaginate } from "../../store/selectors/products.selectors";
import { debounceTime, distinctUntilChanged, exhaustMap, filter } from "rxjs/operators";
import { PartialProduct, ProductFilter, ProductTable, productThresholdArray } from "../../../../models/Product";
import { Sort, TableButton } from "../../../../models/Table";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { toSignal } from "@angular/core/rxjs-interop";
import * as ProductsActions from "../../../products/store/actions/products.actions";
import { createSortArray } from "../../../../../utils/utils";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import { ShowImageComponent } from "../../../../components/show-image/show-image.component";
import { MatIconModule } from "@angular/material/icon";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { CategoriesService } from "../../../categories/services/categories.service";
import { combineLatest, map, of, Subject, takeUntil } from "rxjs";
import { MatSelectComponent } from "../../../../components/mat-select/mat-select.component";
import { selectRouteQueryParamParam } from "../../../../core/router/store/router.selectors";
import { FiltersComponent } from "../../../../components/filters/filters.component";
import { FilterElement, FilterOption } from "../../../../models/Filters";
import { WarehousesService } from "../../../warehouses/services/warehouses.service";
import { animate, style, transition, trigger } from "@angular/animations";
import { Query } from "../../../../../global";
import { SuppliersService } from "../../../suppliers/services/suppliers.service";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [CommonModule, SearchComponent, TableComponent, TableSkeletonComponent, MatDialogModule, ShowImageComponent, MatIconModule, MatOptionModule, FormsModule, ReactiveFormsModule, MatSelectModule, MatSelectComponent, FiltersComponent, ClipboardModule, MatTooltipModule],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('appear', [
      transition(':enter', [
        style({ opacity: 1 }),
        animate('150ms'),
      ]),
      transition(':leave', [
        animate('150ms',
          style({ opacity: 0 }),
        ),
      ])
    ]),
  ],
  template: `
    <div class="flex flex-col gap-3">
      <div class="flex justify-between gap-2">

        <div (click)="toggleFilter()"
             matTooltip="Filtri prodotti"
             [ngStyle]="{'background-color': expandFilter ? '#F2F2F2' : '#FFFFFF'}"
             class="cursor-pointer w-10 rounded-md aspect-square flex font-bold shadow-md bg-foreground text-gray-900 text-sm focus:outline-none p-2">
            <mat-icon *ngIf="!expandFilter" class="material-symbols-rounded">filter_list</mat-icon>
            <mat-icon *ngIf="expandFilter" class="material-symbols-rounded">close</mat-icon>
        </div>
        <div class="grow">
          <app-search [search]="search"/>
        </div>
      </div>

      <app-filters *ngIf="expandFilter" [showFilter]="expandFilter" [filterTabs]="filterTabs" />

      <div *ngIf="productPaginate$ | async as productPaginate else skeleton">
        <app-table [dataSource]="productPaginate"
                   [columns]="columns"
                   [displayedColumns]="displayedColumns"
                   [paginator]="paginator"
                   [buttons]="buttons"
                   (onPageChange)="changePage($event)"
                   (onPageSizeChange)="changePageSize($event)"
                   (onSortChange)="changeSort($event)"
        />
      </div>
    </div>

    <ng-template #skeleton>
      <app-table-skeleton [columns]="columns"/>
    </ng-template>

    <ng-template #imageRow let-row>
      <app-show-image classes="w-16 h-16" [imageUrl]="row.image" [objectName]="row.name"/>
    </ng-template>

    <ng-template #nameRow let-row>
      <div class="flex flex-col">
        <div>{{ row.name }}</div>
        <div class="cursor-pointer">
          <span class="font-mono text-sm bg-gray-100 text-gray-800 font-bold me-2 px-2.5 py-0.5 rounded"
                [cdkCopyToClipboard]="row.sku"
                matTooltip="Clicca per copiare il codice negli appunti">
            {{ row.sku }}
          </span>
        </div>
      </div>
    </ng-template>


    <ng-template #priceRow let-row>
        <div class="flex mb-1 gap-1 items-center">
          <div class="bg-gray-100 flex items-center rounded">
            <mat-icon class="p-0.5 mat-icon-price material-symbols-rounded text-xs">shopping_cart</mat-icon>
          </div>
          <span class="whitespace-nowrap bg-gray-100 text-sm font-medium me-2 px-2.5 py-0.5 rounded">
            <span class="font-bold">€</span> {{ ((row.buyingPrices[0]?.price || 0).toFixed(2)) }}
          </span>
        </div>

        <div class="flex mt-1 gap-1 items-center">
          <div class="bg-gray-100 flex items-center rounded">
            <mat-icon class="p-0.5 mat-icon-price material-symbols-rounded text-xs">sell</mat-icon>
          </div>
          <span class="whitespace-nowrap bg-gray-100 text-sm font-medium me-2 px-2.5 py-0.5 rounded">
            <span class="font-bold">€</span> {{ ((row.sellingPrice || 0).toFixed(2)) }}
          </span>
        </div>
    </ng-template>

    <ng-template #quantityRow let-row>
      <div class="flex-col">
        <div *ngFor="let elem of row.warehouses">
          <span [ngStyle]="{'background-color': (elem.quantity <= row.yellowThreshold && elem.quantity > row.redThreshold) ? '#F9F1E8' : elem.quantity > row.yellowThreshold ? '#D9E7FF' : elem.quantity <= row.redThreshold ? '#F8E9E8' : '', 'color': (elem.quantity <= row.yellowThreshold && elem.quantity > row.redThreshold) ? '#EEA549' : elem.quantity > row.yellowThreshold ? '#397FF4' : elem.quantity <= row.redThreshold ? '#E54F47' : '',}" class="whitespace-nowrap bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
            <span class="font-bold">{{ elem.quantity + " "}}</span> {{ row.warehouseUm?.name + " in "}} <span class="font-bold">{{ elem.warehouse?.name}}</span>
        </span>
        </div>
      </div>
    </ng-template>

    <ng-template #categoryRow let-row>
      <div class="flex flex-wrap gap-1">
        <div class="gap-1" *ngFor="let elem of row.categories">
          <span class="whitespace-nowrap bg-gray-100 text-sm font-bold me-2 px-2.5 py-0.5 rounded">{{ elem.category.name }}</span>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .topunit.mat-mdc-select-panel {
      background-color: white;
    }
    .mat-mdc-form-field-subscript-wrapper {
      margin-bottom: -1.70em;
    }
    .category .mat-mdc-select-min-line{
      display: none;
    }
    mat-icon.mat-icon-price {
      font-size: 20px;
      width: auto;
      height: auto;
    }
  `]
})

export default class ProductsComponent implements OnInit, AfterViewInit {
  @ViewChild("imageRow") imageRow: TemplateRef<any> | undefined;
  @ViewChild("nameRow") nameRow: TemplateRef<any> | undefined;
  @ViewChild("priceRow") priceRow: TemplateRef<any> | undefined;
  @ViewChild("quantityRow") quantityRow: TemplateRef<any> | undefined;
  @ViewChild("categoryRow") categoryRow: TemplateRef<any> | undefined;


  store: Store<AppState> = inject(Store);
  subject = new Subject();
  productPaginate$ = this.store.select(getProductsPaginate);
  dialog = inject(MatDialog);

  queryParams = toSignal(this.store.select(selectRouteQueryParamParam()));

  categoryIds: number[] | undefined;
  warehouseIds: number[] | undefined;
  suppliersIds: number[] | undefined;
  thresholdIds: number[] | undefined;

  columns: any[] = [];
  displayedColumns: string[] = [];

  buttons: TableButton<PartialProduct>[] = [
    { iconName: "delete", bgColor: "red", callback: elem => this.openDialog(elem) },
    { iconName: "edit", bgColor: "orange", callback: elem => this.store.dispatch(RouterActions.go({ path: [`products/${elem.id}`] })) },
    { iconName: "content_copy", bgColor: "sky", tooltipOpts: { text: "Duplica prodotto"}, callback: elem => this.store.dispatch(RouterActions.go({ path: [`products/new`], extras: { queryParams: { productId: elem.id } } })) },
    { iconName: "visibility", bgColor: "sky", callback: elem => this.store.dispatch(RouterActions.go({ path: [`products/${elem.id}/view`] })) },
  ];

  paginator = signal({
    pageIndex: 0,
    pageSize: 10
  });

  sorter: WritableSignal<Sort[]> = signal([{ active: "createdAt", direction: "desc" }]);

  search = new FormControl("");

  query = signal({
    warehouses: [],
    categories: []
  });

  categoriesService = inject(CategoriesService);
  warehousesService = inject(WarehousesService);
  suppliersService = inject(SuppliersService);
  defaultFilterOptions = { page: 1, limit: 40 };

  categories$ = this.categoriesService.loadCategories({ query: {}, options: this.defaultFilterOptions }).pipe(
    map(c => c.docs.map(c => ({ id: c.id, name: c.name, checked: false })))
  );
  warehouses$ = this.warehousesService.loadWarehouses({ query: {}, options: this.defaultFilterOptions }).pipe(
    map(c => c.docs.map(c => ({ id: c.id, name: c.name, checked: false })))
  );
  suppliers$ = this.suppliersService.loadSuppliers({ query: {}, options: this.defaultFilterOptions }).pipe(
    map(c => c.docs.map(c => ({ id: c.id, name: c.name, checked: false })))
  );
  thresholds$ = of(productThresholdArray).pipe(
    map(c => c.map(c => ({ id: c.id, name: c.name, checked: false })))
  );
  filterTabs: FilterElement[] = [];

  expandFilter: boolean = false;

  filters: Query<ProductFilter> = {
    query: {},
    options: {
      populate: "categories.category warehouses.warehouse um warehouseUm",
      limit: this.paginator().pageSize,
      page: (this.paginator().pageIndex + 1),
      sort: createSortArray(this.sorter())
    }
  };

  ngAfterViewInit() {
    Promise.resolve(null).then(() => {
      this.columns = [
        {
          columnDef: 'image',
          header: 'Foto',
          template: this.imageRow,
          width: "5rem",
          sortable: false
        },
        {
          columnDef: 'name',
          header: 'Nome',
          template: this.nameRow,
          width: "15rem",
          sortable: true
        },
        {
          columnDef: 'price',
          header: 'Prezzo',
          template: this.priceRow,
          width: "10rem",
          sortable: false
        },
        {
          columnDef: 'quantityWarehouse',
          header: 'Quantità',
          template: this.quantityRow,
          width: "14rem",
          sortable: false
        },
        {
          columnDef: 'categoryProduct',
          header: 'Categorie',
          template: this.categoryRow,
          width: "12",
          sortable: false
        }
      ];
      this.displayedColumns = [...this.columns.map(c => c.columnDef), "actions"];


      // Sottoscrive più observable in modo tale da creare l'oggetto "filterTabs" da passare al components: "productsFilter"
      combineLatest([
        this.categories$,
        this.warehouses$,
        this.suppliers$,
        this.thresholds$
      ]).pipe(
        takeUntil(this.subject)
      ).subscribe(([ categories, warehouses, suppliers, thresholds]) => {
        this.filterTabs = [
          {
            field: "categories",
            name: "categorie",
            options: categories.map(c => ({ ...c, checked: !!this.categoryIds?.includes(c.id) }))
              .sort((a, b) => Number(b.checked) - Number(a.checked)),
            popUp: false,
            iconName: "plus",
            selectIds: this.categoryIds || [],
            searcher: true,
            searchValue: new FormControl(""),
            onSelectedTab: (tab: FilterElement) => this.onSelectedTab(tab),
            onSelectOption: (tabName: string, option: FilterOption) => this.onSelectedOption(tabName, option)
          },
          {
            field: "warehouses",
            name: "magazzini",
            options: warehouses.map(c => ({ ...c, checked: !!this.warehouseIds?.includes(c.id) }))
              .sort((a, b) => Number(b.checked) - Number(a.checked)),
            popUp: false,
            iconName: "plus",
            selectIds: this.warehouseIds ?? [],
            searcher: false,
            onSelectedTab: (tab: FilterElement) => this.onSelectedTab(tab),
            onSelectOption: (tabName: string, option: FilterOption) => this.onSelectedOption(tabName, option)
          },
          {
            field: "suppliers",
            name: "fornitori",
            options: suppliers.map(c => ({ ...c, checked: !!this.suppliersIds?.includes(c.id) }))
              .sort((a, b) => Number(b.checked) - Number(a.checked)),
            popUp: false,
            iconName: "plus",
            selectIds: this.suppliersIds ?? [],
            searcher: true,
            searchValue: new FormControl(""),
            onSelectedTab: (tab: FilterElement) => this.onSelectedTab(tab),
            onSelectOption: (tabName: string, option: FilterOption) => this.onSelectedOption(tabName, option)
          },
          {
            field: "thresholds",
            name: "soglie",
            options: thresholds.map(c => ({ ...c, checked: !!this.thresholdIds?.includes(c.id) }))
              .sort((a, b) => Number(b.checked) - Number(a.checked)),
            popUp: false,
            iconName: "plus",
            selectIds: this.thresholdIds || [],
            searcher: false,
            onSelectedTab: (tab: FilterElement) => this.onSelectedTab(tab),
            onSelectOption: (tabName: string, option: FilterOption) => this.onSelectedOption(tabName, option)
          }

        ];

        this.filterTabs.forEach(tab => {

          if(tab.searcher) {
            this.onSearchValueChange(tab.field, tab.searchValue!)
          }

        });

      });

    });
  }

  openDialog(product: PartialProduct) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData> {
        title: "Conferma rimozione",
        content: `
        Si sta eliminando il prodotto <b>${product.name}</b>.
        <br>
        Questa operazione non è reversibile.
        `,
        buttons: [
          { iconName: "delete", label: "Elimina", bgColor: "remove", onClick: () => dialogRef.close(true) },
          { iconName: "clear", label: "Annulla",  onClick: () => dialogRef.close(false) }
        ]
      }
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.subject)
    ).subscribe((result: any) => {
      if(!result) {
        return;
      }
      this.deleteProduct(product);
    });
  }

  ngOnInit() {
    if(this.queryParams()) {
      this.expandFilter = true;
    }

    if((this.queryParams() as ProductTable)?.search) {
      this.search.setValue((this.queryParams() as ProductTable).search!, { emitEvent: false })
    }

    this.search.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.subject)
    ).subscribe(res => {
      this.searchProduct({
        ...this.queryParams(),
        search: res || undefined,
      }, true);
    });
  }

  constructor() {

    effect(() => {

      const params = {
        ...this.queryParams()
      } as ProductTable;

      this.categoryIds = params.categories?.split(",").map(c => +c);
      this.warehouseIds = params.warehouses?.split(",").map(c => +c);
      this.suppliersIds = params.suppliers?.split(",").map(c => +c);
      this.thresholdIds = params.thresholds?.split(",").map(c => +c);

      this.filters = {
        ...this.filters,
        query: {
          value: params.search || "",
          categories: params.categories?.split(",").map(c => +c) ?? [],
          warehouses: params.warehouses?.split(",").map(c => +c) ?? [],
          suppliers: params.suppliers?.split(",").map(c => +c) ?? [],

          // Se thresholdIds è uguale a [0] ritorna --> { "underRedThreshold": true, "underYellowThreshold": false }
          ...productThresholdArray.reduce((acc, curr) => ({ ...acc, [curr.field]: this.thresholdIds?.includes(curr.id) }), {})
        },
        options: {
          populate: this.filters.options?.populate,
            limit: +params.pageSize! || 10,
            page: params.pageIndex ? (+params.pageIndex + 1) : 1,
            sort: createSortArray(this.sorter()),
        }
      };

      this.store.dispatch(ProductsActions.editProductFilter({ filters: this.filters }));
      this.updatePaginator({
        pageSize: +params.pageSize! || 10,
        pageIndex: params.pageIndex ? (+params.pageIndex) : 0,
      });

    }, { allowSignalWrites: true });

  }

  searchProduct(payload: ProductTable, resetPageIndex?: boolean): void {
    if(resetPageIndex) {
      payload = { ...payload, pageIndex: 0 };
    }

    this.store.dispatch(RouterActions.go({ path: ["products"], extras: { queryParams: payload } }));
  }

  private deleteProduct(row: PartialProduct) {
    this.store.dispatch(ProductsActions.deleteProduct({ id: row.id! }));
  }

  updatePaginator({ pageIndex, pageSize }: { pageIndex: number, pageSize: number }) {
    this.paginator.update(() => ({ pageIndex, pageSize }));
  }

  changePage(evt: number): void {
    this.searchProduct({
      ...this.queryParams(),
      pageIndex: evt - 1
    });
  }

  changePageSize(evt: number): void {
    this.searchProduct({
      ...this.queryParams(),
      pageIndex: 0,
      pageSize: evt
    });
  }

  changeSort(evt: Sort) {
    this.sorter.mutate(value => {
      value[0] = (evt?.direction === "asc" || evt?.direction === "desc" ? evt : {} as Sort);
    });
  }

  toggleFilter(): void {
    this.expandFilter = !this.expandFilter;

    if(!this.expandFilter) {

      this.filterTabs.forEach(tab => {
        tab.options.forEach(o => {
          if(o.checked) {
            this.onSelectedOption(tab.field, o);
            o.checked = false;
          }
        })
      });

    }
  }

  onSelectedTab(tab: FilterElement) {
    this.filterTabs = this.filterTabs.map((elem) => {
      if(elem.field === tab.field) {
        elem.popUp = !elem.popUp;
        elem.iconName = elem.iconName === "plus" ? "minus" : "plus";
      } else {
        elem.popUp = false;
        elem.iconName = "plus";
      }
      return elem;
    });
  }


  onSelectedOption(tabField: string, option: FilterOption) {

    this.filterTabs = this.filterTabs.map((elem) => {
      if(elem.field === tabField) {
        if(!option.checked) {
          elem.selectIds = [ ...elem.selectIds, option.id ];
          return elem;
        }
        elem.selectIds = elem.selectIds.filter(id => id !== option.id);
      }
      return elem;
    });

    this.searchProduct({
      ...this.queryParams(),
      categories: this.filterTabs.find(t => t.field === "categories")?.selectIds.join(",") || undefined,
      warehouses: this.filterTabs.find(t => t.field === "warehouses")?.selectIds.join(",") || undefined,
      suppliers: this.filterTabs.find(t => t.field === "suppliers")?.selectIds.join(",") || undefined,
      thresholds: this.filterTabs.find(t => t.field === "thresholds")?.selectIds.join(",") || undefined,
    }, true);

  }

  getNewOptionsOnFilter(current: FilterOption[], newOpt: FilterOption[]): FilterOption[] {
    const filtered = current.filter(c => !!c.checked);

    return [
      ...filtered,
      ...newOpt.filter(c => !filtered.map(f => f.id).includes(c.id))
    ]
  }


  onSearchValueChange(field: string, searchValue: FormControl) {
    searchValue?.valueChanges.pipe(
      debounceTime(250),
      takeUntil(this.subject),
      exhaustMap((text: string) => {
        // Categories
        if(field === "categories") {
          return this.categoriesService.loadCategories({ query: { value: text }, options: this.defaultFilterOptions }).pipe(
            map(c => c.docs.map(c => ({ id: c.id, name: c.name, checked: false }))),
          );
        }

        if(field === "suppliers") {
          return this.suppliersService.loadSuppliers({ query: { value: text }, options: this.defaultFilterOptions }).pipe(
            map(c => c.docs.map(c => ({ id: c.id, name: c.name, checked: false }))),
          );
        }
        return of(undefined);
      }),
      filter(obj => !!obj),
    ).subscribe((options: any) => {
      this.filterTabs = this.filterTabs.map(t => ({
        ...t,
        options: t.field === field ? this.getNewOptionsOnFilter(t.options, options) : t.options
      }));
    });
  }

}
