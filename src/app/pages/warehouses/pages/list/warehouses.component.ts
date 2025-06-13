import {
  AfterViewInit,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { PartialWarehouse, WarehouseTable } from "../../../../models/Warehouse";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { MatIconModule } from "@angular/material/icon";
import { getWarehousesPaginate } from "../../store/selectors/warehouses.selectors";
import * as WarehousesActions from "../../store/actions/warehouses.actions";
import { TableComponent } from "../../../../components/table/table.component";
import { Sort, TableButton } from "../../../../models/Table";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { createSortArray } from "../../../../../utils/utils";
import { SearchComponent } from "../../../../components/search/search.component";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { TableSkeletonComponent } from "../../../../components/skeleton/table-skeleton.component";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { selectRouteQueryParamParam } from "../../../../core/router/store/router.selectors";
import { Subject } from "rxjs";


@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [CommonModule, TableComponent, MatIconModule, ReactiveFormsModule, SearchComponent, NgxSkeletonLoaderModule, TableSkeletonComponent, MatDialogModule],
  template: `

    <div class="grid gap-3">
      <app-search [search]="search" />
      <div *ngIf="warehousePaginate$ | async as warehousePaginate else skeleton">
        <app-table [dataSource]="warehousePaginate"
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

  `,
  styles: []
})

export default class WarehousesComponent implements AfterViewInit, OnInit {

  store: Store<AppState> = inject(Store);
  warehousePaginate$ = this.store.select(getWarehousesPaginate);
  dialog = inject(MatDialog);
  subject = new Subject();
  queryParams = toSignal(this.store.select(selectRouteQueryParamParam()));

  columns: any[] = [];
  displayedColumns: string[] = [];
  buttons: TableButton<PartialWarehouse>[] = [
    { iconName: "edit", bgColor: "orange", callback: elem => this.store.dispatch(RouterActions.go({ path: [`warehouses/${elem.id}`] })) },
    { iconName: "format_list_bulleted", bgColor: "sky",tooltipOpts: { text: "Prodotti del magazzino" }, callback: elem => this.store.dispatch(RouterActions.go({ path: [`products`], extras: { queryParams: { warehouses: elem.id } } })) }
  ];

  paginator = signal({
    pageIndex: 0,
    pageSize: 10
  });

  sorter: WritableSignal<Sort[]> = signal([{ active: "createdAt", direction: "desc" }]);

  search = new FormControl("");

  ngAfterViewInit() {
    Promise.resolve(null).then(() => {
      this.columns = [
        {
          columnDef: 'name',
          header: 'Nome',
          cell: (element: PartialWarehouse) => `${element.name}`,
          sortable: true
        },
        {
          columnDef: 'address',
          header: 'Indirizzo',
          cell: (element: PartialWarehouse) => `${element.address}`,
          sortable: true
        }
      ];
      this.displayedColumns = [...this.columns.map(c => c.columnDef), "actions"];
    });
  }

  ngOnInit() {

    if((this.queryParams() as WarehouseTable)?.search) {
      this.search.setValue((this.queryParams() as WarehouseTable).search!, { emitEvent: false })
    }

    this.search.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.subject)
    ).subscribe(res => {
      this.searchWarehouse({
        ...this.queryParams(),
        search: res || undefined,
      }, true);
    });
  }

  constructor() {

    // Questo effect viene triggerato ogni qual volta un dei signal presenti all'interno cambia di valore
    effect(() => {
      const params = {
        ...this.queryParams()
      } as WarehouseTable;

      this.store.dispatch(
        WarehousesActions.loadWarehouses({
          query: {
            query: {
              value: params.search || ""
            },
            options: {
              limit: +params.pageSize! || 10,
              page: params.pageIndex ? (+params.pageIndex + 1) : 1,
              sort: createSortArray(this.sorter())
            }
          }
        })
      );

      this.updatePaginator({
        pageSize: +params.pageSize! || 10,
        pageIndex: params.pageIndex ? (+params.pageIndex) : 0,
      });

    }, { allowSignalWrites: true })
  }

  searchWarehouse(payload: WarehouseTable, resetPageIndex?: boolean): void {
    if(resetPageIndex) {
      payload = { ...payload, pageIndex: 0 };
    }

    this.store.dispatch(RouterActions.go({ path: ["warehouses"], extras: { queryParams: payload } }));
  }

  openDialog(warehouse: PartialWarehouse) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData> {
        title: "Conferma rimozione",
        content: `
        Si sta eliminando il magazzino ${warehouse.name}.
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
      this.deleteWarehouse(warehouse);
    });
  }

  private deleteWarehouse(row: PartialWarehouse) {
    this.store.dispatch(WarehousesActions.deleteWarehouse({ id: row.id! }));
  }

  updatePaginator({ pageIndex, pageSize }: { pageIndex: number, pageSize: number }) {
    this.paginator.update(() => ({ pageIndex, pageSize }));
  }

  changePage(evt: number): void {
    this.searchWarehouse({
      ...this.queryParams(),
      pageIndex: evt - 1
    });
  }

  changePageSize(evt: number): void {
    this.searchWarehouse({
      ...this.queryParams(),
      pageIndex: 0,
      pageSize: evt
    });
  }

  changeSort(evt: Sort): void {
    this.sorter.mutate(value => {
      value[0] = (evt?.direction === "asc" || evt?.direction === "desc" ? evt : {} as Sort);
    });
  }
}
