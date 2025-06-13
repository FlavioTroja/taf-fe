import {
  AfterViewInit,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from "../../../../components/search/search.component";
import { TableComponent } from "../../../../components/table/table.component";
import { TableSkeletonComponent } from "../../../../components/skeleton/table-skeleton.component";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { getSuppliersPaginate } from "../../store/selectors/suppliers.selectors";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { Sort, TableButton } from "../../../../models/Table";
import { PartialSupplier, SupplierTable } from "../../../../models/Supplier";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { FormControl } from "@angular/forms";
import { toSignal } from "@angular/core/rxjs-interop";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import * as SuppliersActions from "../../../suppliers/store/actions/suppliers.actions";
import { createSortArray } from "../../../../../utils/utils";
import {MatIconModule} from "@angular/material/icon";
import { selectRouteQueryParamParam } from "../../../../core/router/store/router.selectors";
import { Subject } from "rxjs";

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, SearchComponent, TableComponent, TableSkeletonComponent, MatDialogModule, MatIconModule],
  template: `
    <div class="grid gap-3">
      <app-search [search]="search" />
      <div *ngIf="supplierPaginate$ | async as supplierPaginate else skeleton">
        <app-table [dataSource]="supplierPaginate"
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

    <ng-template #nameRow let-row>
      <div class="flex flex-col justify-center">{{ row?.name }}</div>
    </ng-template>

    <ng-template #cityRow let-row>
      <div class="flex gap-2">
        <a *ngIf="row.email" [href]="'mailto:' + row.email" class="inline-flex items-center px-2.5 py-0.5 rounded-md shadow-sm accent text-sm font-medium fit-content">
          <mat-icon class="icon-size material-symbols-rounded">mail</mat-icon>&nbsp;{{ row?.email?.toLowerCase() }}
        </a>

        <a *ngIf="row.phone" [href]="'https://wa.me/' + row.phone" target="_blank"  class="inline-flex items-center px-2.5 py-0.5 rounded-md shadow-sm accent text-sm font-medium fit-content">
          <mat-icon class="icon-size material-symbols-rounded">phone</mat-icon>&nbsp;{{ row.phone }}
        </a>
      </div>
    </ng-template>

    <ng-template #addressRow let-row>
      <h1>{{ row.address?.address }}, {{ row.address?.number }} - {{ row.address?.city }} ({{ row.address?.province.toUpperCase() }})</h1>
    </ng-template>
  `,
  styles: [
  ]
})
export default class SuppliersComponent implements AfterViewInit, OnInit {
  @ViewChild("nameRow") nameRow: TemplateRef<any> | undefined;
  @ViewChild("cityRow") cityRow: TemplateRef<any> | undefined;
  @ViewChild("addressRow") addressRow: TemplateRef<any> | undefined;

  store: Store<AppState> = inject(Store);
  subject = new Subject();
  supplierPaginate$ = this.store.select(getSuppliersPaginate).pipe(debounceTime(200));
  dialog = inject(MatDialog);

  queryParams = toSignal(this.store.select(selectRouteQueryParamParam()));

  columns: any[] = [];
  displayedColumns: string[] = [];

  buttons: TableButton<PartialSupplier>[] = [
    { iconName: "delete", bgColor: "red", callback: elem => this.openDialog(elem) },
    { iconName: "edit", bgColor: "orange", callback: elem => this.store.dispatch(RouterActions.go({ path: [`suppliers/${elem.id}`] })) },
    { iconName: "visibility", bgColor: "sky", callback: elem => this.store.dispatch(RouterActions.go({ path: [`suppliers/${elem.id}/view`] })) }
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
          template: this.nameRow,
          width: "15rem",
          sortable: true
        },
        {
          columnDef: 'address',
          header: 'Indirizzo',
          template: this.addressRow,
          width: "20rem",
          sortable: false
        },
        {
          columnDef: 'email',
          header: 'Contatto',
          template: this.cityRow,
          width: "25rem",
          sortable: false
        }
      ];
      this.displayedColumns = [...this.columns.map(c => c.columnDef), "actions"];
    })
  }

  ngOnInit(): void {

    if((this.queryParams() as SupplierTable)?.search) {
      this.search.setValue((this.queryParams() as SupplierTable).search!, { emitEvent: false })
    }

    this.search.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.subject)
    ).subscribe(res => {
      this.searchSupplier({
        ...this.queryParams(),
        search: res || undefined,
      }, true);
    });
  }

  openDialog(supplier: PartialSupplier) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData> {
        title: "Conferma rimozione",
        content: `
        Si sta eliminando il fornitore ${supplier.name}.
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
      this.deleteSupplier(supplier);
    });
  }

  constructor() {
    // Questo effect viene triggerato ogni qual volta un dei signal presenti all'interno cambia di valore
    effect(() => {

      const params = {
        ...this.queryParams()
      } as SupplierTable;

      this.store.dispatch(
        SuppliersActions.loadSuppliers({
          query: {
            query: {
              value: params.search || "",
            },
            options: {
              populate: 'address',
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

  searchSupplier(payload: SupplierTable, resetPageIndex?: boolean): void {
    if(resetPageIndex) {
      payload = { ...payload, pageIndex: 0 };
    }

    this.store.dispatch(RouterActions.go({ path: ["suppliers"], extras: { queryParams: payload } }));
  }

  private deleteSupplier(row: PartialSupplier) {
    this.store.dispatch(SuppliersActions.deleteSupplier({ id: row.id! }));

  }

  updatePaginator({ pageIndex, pageSize }: { pageIndex: number, pageSize: number }) {
    this.paginator.update(() => ({ pageIndex, pageSize }));
  }

  changePage(evt: number): void {
    this.searchSupplier({
      ...this.queryParams(),
      pageIndex: evt - 1
    });
  }

  changePageSize(evt: number): void {
    this.searchSupplier({
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
}
