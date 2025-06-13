import {
  AfterViewInit,
  Component,
  effect,
  inject, OnInit,
  signal,
  TemplateRef,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from "../../../../components/search/search.component";
import { TableComponent } from "../../../../components/table/table.component";
import { TableSkeletonComponent } from "../../../../components/skeleton/table-skeleton.component";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { CargoFilter, CargoTable, PartialCargo } from "../../../../models/Cargo";
import { Sort, TableButton } from "../../../../models/Table";
import { FormControl } from "@angular/forms";
import { toSignal } from "@angular/core/rxjs-interop";
import * as CargosActions from "../../../cargos/store/actions/cargos.actions";
import { createSortArray, formatDateWithHour } from "../../../../../utils/utils";
import { getCargosPaginate } from "../../store/selectors/cargos.selectors";
import { MatIconModule } from "@angular/material/icon";
import { ShowImageComponent } from "../../../../components/show-image/show-image.component";
import EditCargoComponent from "../edit/edit-cargo.component"
import * as RouterActions from "../../../../core/router/store/router.actions";
import { Query } from "../../../../../global";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Subject } from "rxjs";
import { selectRouteQueryParamParam } from "../../../../core/router/store/router.selectors";

@Component({
  selector: 'app-cargos',
  standalone: true,
  imports: [CommonModule, SearchComponent, TableComponent, MatIconModule, TableSkeletonComponent, ShowImageComponent, EditCargoComponent, ClipboardModule, MatTooltipModule],
  template: `
    <div class="flex flex-col gap-3">
      <div class="text-2xl font-extrabold">Nuova movimentazione</div>

      <app-edit-cargo />

      <div class="text-2xl font-extrabold pt-3">Storico movimentazioni</div>

      <app-search [search]="search" />
      <div *ngIf="cargoPaginate$ | async as cargoPaginate else skeleton">
        <app-table [dataSource]="cargoPaginate"
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
      <app-table-skeleton [columns]="columns" />
    </ng-template>

    <ng-template #productRow let-row>
      <div class="flex flex-row gap-3">
            <div class="flex flex-col">
              <app-show-image classes="w-16 h-16" [imageUrl]="row.product?.image" [objectName]="row.product?.name" />
            </div>
            <div class="flex flex-col justify-center">
                <div>{{ row.product?.name }}</div>
                <div class="cursor-pointer">
                  <span class="font-mono text-sm bg-gray-100 text-gray-800 font-bold me-2 px-2.5 py-0.5 rounded"
                        [cdkCopyToClipboard]="row.product?.sku"
                        matTooltip="Clicca per copiare il codice negli appunti">
                    {{ row.product?.sku }}
                  </span>
                </div>
            </div>
        </div>
    </ng-template>

    <ng-template #moveRow let-row>
      <div class="flex items-center gap-1 w-max">

        <span class="light-blu blue text-xs px-2 h-7 rounded flex items-center gap-1"
              *ngIf="(row?.toWarehouseId && row?.fromWarehouseId) || (!row?.fromWarehouseId && row?.quantity < 0)">
          <mat-icon class="icon-size material-symbols-rounded-filled blue">warehouse</mat-icon>
          <div *ngIf="(row?.toWarehouseId && !row?.fromWarehouseId) && row?.quantity < 0">{{ row?.toWarehouse?.name }}</div>
          <div *ngIf="row?.fromWarehouseId">{{ row?.fromWarehouse?.name }}</div>
        </span>

        <mat-icon class="icon-size material-symbols-rounded blue"
                  *ngIf="(row?.toWarehouseId && row?.fromWarehouseId) || (!row?.fromWarehouseId && row?.quantity < 0)">
          arrow_right_alt
        </mat-icon>

        <span class="text-xs flex items-center gap-1 px-2 h-7 rounded"
              [ngClass]="{ 'light-red red': row?.quantity < 0, 'green light-green' : row?.quantity > 0, 'light-blu blue': row?.quantity === 0 }">
          {{ row?.quantity }}
          <span class="font-bold">{{ row.product?.warehouseUm?.name }}</span>
        </span>

              <mat-icon class="icon-size material-symbols-rounded blue"
                        *ngIf="(row?.toWarehouseId && row?.fromWarehouseId) || (!row?.fromWarehouseId && row?.quantity > 0)">
                arrow_right_alt
              </mat-icon>

        <span class="light-blu blue text-xs px-2 h-7 rounded flex items-center gap-1"
              *ngIf="(row?.toWarehouseId && row?.fromWarehouseId) || (!row?.fromWarehouseId && row?.quantity > 0)">
          <mat-icon class="icon-size material-symbols-rounded-filled blue">warehouse</mat-icon>
          <div *ngIf="((row?.toWarehouseId && !row?.fromWarehouseId) && row?.quantity > 0) || row?.toWarehouseId && row?.fromWarehouseId">
            {{ row?.toWarehouse?.name}}
          </div>
        </span>

      </div>
    </ng-template>

    <ng-template #originReferenceRow let-row>
      <div *ngIf="row.orderId" class="flex bg-foreground rounded-full p-2 shadow-md gap-3 cursor-pointer fit-content"
           (click)="navigateOnOrder(row.orderId)"
           matTooltip="Vai all'ordine">
        <div class="flex self-center">
          <mat-icon class="material-symbols-rounded">orders</mat-icon>
        </div>
        <div class="font-semibold flex self-center whitespace-nowrap px-0.5">
          {{ row.order.name }}
        </div>
      </div>

      <div *ngIf="row.purchaseDDTId" class="flex bg-foreground rounded-full p-2 shadow-md gap-3 cursor-pointer fit-content"
           (click)="navigateOnDDT(row.purchaseDDTId)"
           matTooltip="Vai al DDT">
        <div class="flex self-center">
          <mat-icon class="material-symbols-rounded">local_shipping</mat-icon>
        </div>
        <div class="font-semibold flex self-center whitespace-nowrap px-0.5">
          DDT N° {{ row.purchaseDDT.fullCode }}
        </div>
      </div>
    </ng-template>

    <ng-template #noteRow let-row>
        <div class="w-full truncate">
          {{ row.note }}
        </div>
    </ng-template>
  `,
  styles: [
  ]
})
export default class CargosComponent implements AfterViewInit, OnInit {
  @ViewChild("productRow") productRow: TemplateRef<any> | undefined;
  @ViewChild("moveRow") moveRow: TemplateRef<any> | undefined;
  @ViewChild("noteRow") noteRow: TemplateRef<any> | undefined;
  @ViewChild("originReferenceRow") orderReferenceRow: TemplateRef<any> | undefined;

  store: Store<AppState> = inject(Store);
  subject = new Subject();
  cargoPaginate$ = this.store.select(getCargosPaginate);

  queryParams = toSignal(this.store.select(selectRouteQueryParamParam()));

  columns: any[] = [];
  displayedColumns: string[] = [];

  buttons: TableButton<PartialCargo>[] = [];

  paginator = signal({
    pageIndex: 0,
    pageSize: 10
  });

  sorter: WritableSignal<Sort[]> = signal([{ active: "createdAt", direction: "desc" }]);

  search = new FormControl("");

  filters: Query<CargoFilter> = {
    query: {},
    options: {
      populate: "fromWarehouse toWarehouse product product.um product.warehouseUm",
      limit: this.paginator().pageSize,
      page: (this.paginator().pageIndex + 1),
      sort: createSortArray(this.sorter())
    }
  };

  ngAfterViewInit() {

    Promise.resolve(null).then(() => {
      this.columns = [
        {
          columnDef: 'id',
          header: 'Prodotto',
          width: "20rem",
          template: this.productRow,
          sortable: false
        },
        {
          columnDef: 'createdAt',
          header: 'Data',
          width: "10rem",
          cell: (element: PartialCargo) => `${formatDateWithHour(element.createdAt!)}`,
          sortable: true
        },
        {
          columnDef: 'name',
          header: 'Movimento',
          width: "15rem",
          template: this.moveRow,
          sortable: false
        },
        {
          columnDef: 'originReference',
          header: "Origine",
          width: "10rem",
          template: this.orderReferenceRow,
          sortable: false
        },
        {
          columnDef: 'note',
          header: 'Note',
          width: "24rem",
          template: this.noteRow,
          sortable: false
        }
      ];
      this.displayedColumns = [...this.columns.map(c => c.columnDef), "actions"];
    })
  }

  ngOnInit(): void {

    if((this.queryParams() as CargoTable)?.search) {
      this.search.setValue((this.queryParams() as CargoTable).search!, { emitEvent: false })
    }

    this.search.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.subject)
    ).subscribe(res => {
      this.searchCargo({
        ...this.queryParams(),
        search: res || undefined,
      }, true);
    });
  }

  constructor() {
    effect(() => {

      const params = {
        ...this.queryParams()
      } as CargoTable;

      this.filters = {
        ...this.filters,
        query: {
          value: params.search || "",
        },
        options: {
          populate: this.filters.options?.populate,
          limit: +params.pageSize! || 10,
          page: params.pageIndex ? (+params.pageIndex + 1) : 1,
          sort: createSortArray(this.sorter())
        }
      };

      this.store.dispatch(CargosActions.editCargoFilter({ filters: this.filters }));

      this.updatePaginator({
        pageSize: +params.pageSize! || 10,
        pageIndex: params.pageIndex ? (+params.pageIndex) : 0,
      });

    }, { allowSignalWrites: true });

  }

  searchCargo(payload: CargoTable, resetPageIndex?: boolean): void {
    if(resetPageIndex) {
      payload = { ...payload, pageIndex: 0 };
    }

    this.store.dispatch(RouterActions.go({ path: ["cargos"], extras: { queryParams: payload } }));
  }

  updatePaginator({ pageIndex, pageSize }: { pageIndex: number, pageSize: number }) {
    this.paginator.update(() => ({ pageIndex, pageSize }));
  }

  changePage(evt: number): void {
    this.searchCargo({
      ...this.queryParams(),
      pageIndex: evt - 1
    });
  }

  changePageSize(evt: number): void {
    this.searchCargo({
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

  navigateOnOrder(id: number) {
    this.store.dispatch(RouterActions.go({ path: [ `/orders/${ id }/view` ] }));
  }

  navigateOnDDT(id: number) {
    this.store.dispatch(RouterActions.go({ path: [ `/purchaseDdts/${ id }/view` ] }));
  }

}
