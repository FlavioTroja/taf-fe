import { Component, effect, inject, signal, TemplateRef, ViewChild, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from "@angular/core/rxjs-interop";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import * as WarehouseActions from "../../store/actions/warehouses.actions";
import { getWarehouseProducts } from "../../store/selectors/warehouses.selectors";
import { TableComponent } from "../../../../components/table/table.component";
import { TableSkeletonComponent } from "../../../../components/skeleton/table-skeleton.component";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { Table, Sort, TableButton } from "../../../../models/Table";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import * as ProductsActions from "../../../products/store/actions/products.actions";
import { createSortArray } from "../../../../../utils/utils";
import { map } from "rxjs";
import { ProductsOnWarehouses } from "../../../../models/ProductsOnWarehouses";
import { ShowImageComponent } from "../../../../components/show-image/show-image.component";

@Component({
  selector: 'app-products-on-warehouse',
  standalone: true,
  imports: [CommonModule, TableComponent, TableSkeletonComponent, MatDialogModule, ShowImageComponent],
  template: `
    <div class="grid gap-3">
      <div *ngIf="productPaginate$ | async as productPaginate else skeleton">
        <app-table [dataSource]="productPaginate"
                   [columns]="columns"
                   [displayedColumns]="displayedColumns"
                   [paginator]="paginator"
                   [buttons]="buttons"
                   (onPageChange)="changePage($event)"
                   (onSortChange)="changeSort($event)"
        />
      </div>
    </div>

    <ng-template #skeleton>
      <app-table-skeleton [columns]="columns" />
    </ng-template>

    <ng-template #imageRow let-row>
      <app-show-image classes="w-16 h-16" [imageUrl]="row.product?.image" [objectName]="row.product?.name" />
    </ng-template>

    <ng-template #nameRow let-row>
      <div class="flex flex-col">
        <div>{{row.product?.name}}</div>
        <div>
              <span class="bg-gray-100 text-gray-800 text-xs font-bold me-2 px-2.5 py-0.5 rounded">
                {{row.product?.id}} - {{row.product?.ean}} - {{row.product?.sku}}
              </span>
        </div>
      </div>
    </ng-template>

    <ng-template #priceRow let-row>
      <span class="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
        <span class="font-bold">€</span> {{ (row.product?.sellingPrice) }}
      </span>
    </ng-template>

    <ng-template #quantityRow let-row>
      <span class="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
        <span class="font-bold">{{ row.quantity }}</span> {{ row.product?.um?.name }}
      </span>
    </ng-template>
  `,
  styles: [
  ]
})
export default class ProductsOnWarehouseComponent {

  @ViewChild("imageRow") imageRow: TemplateRef<any> | undefined;
  @ViewChild("nameRow") nameRow: TemplateRef<any> | undefined;
  @ViewChild("priceRow") priceRow: TemplateRef<any> | undefined;
  @ViewChild("quantityRow") quantityRow: TemplateRef<any> | undefined;

  store: Store<AppState> = inject(Store);
  productPaginate$ = this.store.select(getWarehouseProducts).pipe(
    map(result => result?.products)
  );
  id = toSignal(this.store.select(selectCustomRouteParam("id")));
  dialog = inject(MatDialog);

  columns: any[] = [];
  displayedColumns: string[] = [];

  buttons: TableButton<ProductsOnWarehouses>[] = [
    { iconName: "delete", bgColor: "red", callback: elem => this.openDialog(elem) },
    { iconName: "edit", bgColor: "orange", callback: elem => this.store.dispatch(RouterActions.go({ path: [`products/${elem.productId}`] })) },
    { iconName: "open_with", bgColor: "sky", callback: elem => this.store.dispatch(RouterActions.go({ path: [`cargos`],
        extras: { queryParams: { warehouseId: elem.warehouseId, productId: elem.productId } }
    })) }
  ];

  paginator: WritableSignal<Table> = signal({
    pageIndex: 0,
    pageSize: 10
  });

  sorter: WritableSignal<Sort[]> = signal([{ active: "createdAt", direction: "desc" }]);

  ngAfterViewInit() {
    Promise.resolve(null).then(() => {
      this.columns = [
        {
          columnDef: 'product.image',
          header: 'Foto',
          template: this.imageRow,
          width: "5rem",
        },
        {
          columnDef: 'product.name',
          header: 'Nome',
          template: this.nameRow,
          width: "15rem",
        },
        {
          columnDef: 'product.sellingPrice',
          header: 'Prezzo',
          template: this.priceRow,
          width: "7rem",
        },
        {
          columnDef: 'quantity',
          header: 'Quantità',
          template: this.quantityRow,
          width: "7rem",
        }
      ];
      this.displayedColumns = [...this.columns.map(c => c.columnDef), "actions"];
    })
  }

  openDialog(product: ProductsOnWarehouses) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData> {
        title: "Conferma rimozione",
        content: `
        Si sta eliminando il prodotto ${product.quantity}.
        <br>
        Questa operazione non è reversibile.
        `,
        buttons: [
          { iconName: "delete", label: "Elimina", bgColor: "remove", onClick: () => dialogRef.close(true) },
          { iconName: "clear", label: "Annulla",  onClick: () => dialogRef.close(false) }
        ]
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if(!result) {
        return;
      }
      this.deleteProduct(product);
    });
  }

  constructor() {
    // Questo effect viene triggerato ogni qual volta un dei signal presenti all'interno cambia di valore
    effect(() => {
      this.store.dispatch(
        WarehouseActions.loadWarehouseProducts({
          id: this.id(),
          query: {
            options: {
              limit: this.paginator().pageSize,
              page: (this.paginator().pageIndex + 1),
              sort: createSortArray(this.sorter()),
              populate: "product product.um"
            }
          }
        })
      );
    }, { allowSignalWrites: true })
  }

  private deleteProduct(row: ProductsOnWarehouses) {
    this.store.dispatch(ProductsActions.deleteProduct({ id: row.productId! }));
  }

  changePage(evt: number) {
    this.paginator
      .update((curr) => ({ ...curr, pageIndex: evt - 1 }));
  }

  changeSort(evt: Sort) {
    this.sorter.mutate(value => {
      value[0] = (evt?.direction === "asc" || evt?.direction === "desc" ? evt : {} as Sort);
    });
  }

}
