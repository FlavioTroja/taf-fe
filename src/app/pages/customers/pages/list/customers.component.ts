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
import { ShowImageComponent } from "../../../../components/show-image/show-image.component";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { getCustomersPaginate } from "../../store/selectors/customers.selectors";
import { FormControl } from "@angular/forms";
import { Sort, TableButton } from "../../../../models/Table";
import *  as RouterActions from "../../../../core/router/store/router.actions";
import { toSignal } from "@angular/core/rxjs-interop";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import * as CustomerActions from "../../../customers/store/actions/customers.actions";
import { createSortArray } from "../../../../../utils/utils";
import { CustomerFilter, CustomerTable, customerTypeArray, PartialCustomer } from "../../../../models/Customer";
import { MatIconModule } from "@angular/material/icon";
import { selectRouteQueryParamParam } from "../../../../core/router/store/router.selectors";
import { FilterElement, FilterOption } from "../../../../models/Filters";
import { Query } from "../../../../../global";
import { Subject } from "rxjs";
import { FiltersComponent } from "../../../../components/filters/filters.component";
import { Address } from "../../../../models/Address";

@Component({
  selector: 'app-list-customer',
  standalone: true,
  imports: [CommonModule, SearchComponent, TableComponent, TableSkeletonComponent, MatDialogModule, ShowImageComponent, MatIconModule, FiltersComponent],
  template: `
    <div class="grid gap-3">

      <div class="flex justify-between gap-2">

        <div (click)="toggleFilter()"
             [ngStyle]="{'background-color': expandFilter ? '#F2F2F2' : '#FFFFFF'}"
             class="cursor-pointer w-10 rounded-md aspect-square flex font-bold shadow-md bg-foreground text-gray-900 text-sm focus:outline-none p-2">
          <mat-icon *ngIf="!expandFilter" class="material-symbols-rounded">filter_list</mat-icon>
          <mat-icon *ngIf="expandFilter" class="material-symbols-rounded">close</mat-icon>
        </div>
        <div class="grow">
          <app-search [search]="search"/>
        </div>
      </div>

      <app-filters [showFilter]="expandFilter" [filterTabs]="filterTabs" />

      <div *ngIf="customerPaginate$ | async as customerPaginate else skeleton">
        <app-table
          [dataSource]="customerPaginate"
          [columns]="columns"
          [displayedColumns]="displayedColumns"
          [paginator]="paginator"
          [buttons]="buttons"
          (onPageChange)="changePage($event)"
          (onPageSizeChange)="changePageSize($event)"
          (onSortChange)="changeSort($event)"/>
      </div>
    </div>
    <ng-template #nameRow let-row>
      <div class="flex flex-col justify-center">
        <h1>{{ row.name }}</h1>
      </div>
    </ng-template>

    <ng-template #typeRow let-row>
      <div class="bg-gray-100 rounded-full max-w-max py-1 px-2 flex justify-between items-center">
        <mat-icon class="material-symbols-rounded">
          <span *ngIf="row.type === 'PRIVATO'">boy</span>
          <span *ngIf="row.type === 'INSTALLATORE'">install_desktop</span>
          <span *ngIf="row.type === 'DISTRIBUTORE'">circles_ext</span>
          <span *ngIf="row.type === 'RIVENDITORE'">partner_exchange</span>
        </mat-icon>
        <span class="px-1">{{ formatType(row.type) }}</span>
      </div>
    </ng-template>

    <ng-template #contactRow let-row>
      <div class="flex flex-col gap-2">
        <a *ngIf="row.email" [href]="'mailto:' + row.email" class="inline-flex items-center px-2.5 py-0.5 rounded-md shadow-sm accent text-sm font-medium fit-content">
          <mat-icon class="icon-size material-symbols-rounded">mail</mat-icon>&nbsp;{{ row?.email?.toLowerCase() }}
        </a>

        <a *ngIf="row.phone" [href]="'https://wa.me/' + row.phone" target="_blank"  class="inline-flex items-center px-2.5 py-0.5 rounded-md shadow-sm accent text-sm font-medium fit-content">
          <mat-icon class="icon-size material-symbols-rounded">phone</mat-icon>&nbsp;{{ row.phone }}
        </a>
      </div>
    </ng-template>

    <ng-template #addressRow let-row>
      <div *ngIf="getBillingAddress(row.addresses) as billAddress">
        {{ billAddress.address }}, {{ billAddress.number }} - {{ billAddress.city }} ({{ billAddress.province.toUpperCase() }})
      </div>
    </ng-template>

    <ng-template #skeleton>
      <app-table-skeleton [columns]="columns"/>
    </ng-template>
  `,
  styles: []
})
export default class ListCustomerComponent implements OnInit, AfterViewInit {

  @ViewChild("nameRow") nameRow: TemplateRef<any> | undefined;
  @ViewChild("contactRow") contactRow: TemplateRef<any> | undefined;
  @ViewChild("addressRow") addressRow: TemplateRef<any> | undefined;
  @ViewChild("typeRow") typeRow: TemplateRef<any> | undefined;

  store: Store<AppState> = inject(Store);
  customerPaginate$ = this.store.select(getCustomersPaginate);
  dialog = inject(MatDialog);
  subject = new Subject();
  queryParams = toSignal(this.store.select(selectRouteQueryParamParam()));

  typeValues: number[] | undefined;

  columns: any[] = [];
  displayedColumns: string[] = [];

  buttons: TableButton<PartialCustomer>[] = [
    { iconName: "delete", bgColor: "red", callback: elem => this.openDialog(elem) },
    { iconName: "edit", bgColor: "orange", callback: elem => this.store.dispatch(RouterActions.go({ path: [`customers/${elem.id}`] })) },
    { iconName: "visibility", bgColor: "sky", callback: elem => this.store.dispatch(RouterActions.go({ path: [`customers/${elem.id}/view`] })) }
  ];

  paginator = signal({
    pageIndex: 0,
    pageSize: 10
  });

  sorter: WritableSignal<Sort[]> = signal([{ active: "createdAt", direction: "desc" }]);

  search = new FormControl("");

  expandFilter: boolean = false;
  filterTabs: FilterElement[] = [];

  filters: Query<CustomerFilter> = {
    query: {},
    options: {
      populate: "addresses",
      limit: this.paginator().pageSize,
      page: (this.paginator().pageIndex + 1),
      sort: createSortArray(this.sorter())
    }
  };

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
          header: 'Indirizzo Predefinito',
          template: this.addressRow,
          width: "30rem",
          sortable: false
        },
        {
          columnDef: 'type',
          header: 'Tipologia Cliente',
          template: this.typeRow,
          width: "15rem",
          sortable: true
        },
        {
          columnDef: 'email',
          header: 'Contatto',
          template: this.contactRow,
          width: "25rem",
          sortable: false
        }
      ];
      this.displayedColumns = [...this.columns.map(c => c.columnDef), "actions"];

      this.filterTabs = [
        {
          field: "typeValues",
          name: "tipologia cliente",
          options: customerTypeArray.map((c, i) => ({ id: i, name: c.name, checked: !!this.typeValues?.includes(i) })),
          popUp: false,
          iconName: "plus",
          selectIds: this.typeValues || [],
          searcher: false,
          onSelectedTab: (tab: FilterElement) => this.onSelectedTab(tab),
          onSelectOption: (tabName: string, option: FilterOption) => this.onSelectedOption(tabName, option)
        },
      ];
    })
  }

  openDialog(customer: PartialCustomer) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData> {
        title: "Conferma rimozione",
        content: `
        Si sta eliminando il cliente ${customer.name}.
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
      this.deleteCustomer(customer);
    });
  }

  ngOnInit() {
    if(this.queryParams()) {
      this.expandFilter = true;
    }

    if((this.queryParams() as CustomerTable)?.search) {
      this.search.setValue((this.queryParams() as CustomerTable).search!, { emitEvent: false })
    }

    this.search.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.subject)
    ).subscribe(res => {
      this.searchCustomer({
        ...this.queryParams(),
        search: res || undefined,
      }, true);
    });
  }

  constructor() {
    effect(() => {

      const params = {
        ...this.queryParams()
      } as CustomerTable;

      this.typeValues = params.typeValues?.split(",").map(i => +i);

      this.filters = {
        ...this.filters,
        query: {
          value: params.search || "",
          typeValues: params.typeValues?.split(",").map(i => customerTypeArray[+i].value) ?? [],
        },
        options: {
          populate: this.filters.options?.populate,
          limit: +params.pageSize! || 10,
          page: params.pageIndex ? (+params.pageIndex + 1) : 1,
          sort: createSortArray(this.sorter())
        }
      };

      this.store.dispatch(CustomerActions.editCustomerFilter({ filters: this.filters }));
      this.updatePaginator({
        pageSize: +params.pageSize! || 10,
        pageIndex: params.pageIndex ? (+params.pageIndex) : 0,
      });

    }, { allowSignalWrites: true });

  }

  searchCustomer(payload: CustomerTable, resetPageIndex?: boolean): void {
    if(resetPageIndex) {
      payload = { ...payload, pageIndex: 0 };
    }

    this.store.dispatch(RouterActions.go({ path: ["customers"], extras: { queryParams: payload } }));
  }

  private deleteCustomer(row: PartialCustomer) {
    this.store.dispatch(CustomerActions.deleteCustomer({ id: row.id! }));
  }

  updatePaginator({ pageIndex, pageSize }: { pageIndex: number, pageSize: number }) {
    this.paginator.update(() => ({ pageIndex, pageSize }));
  }

  changePage(evt: number): void {
    this.searchCustomer({
      ...this.queryParams(),
      pageIndex: evt - 1
    });
  }

  changePageSize(evt: number): void {
    this.searchCustomer({
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

  getBillingAddress(addresses: Address[]) {
    const billAddress = addresses.find(a => a.billing);

    if(!billAddress) {
      return addresses[0];
    }
    return billAddress;
  }

  formatType(value: string): string {
    return customerTypeArray.find(o => o.value === value)?.name || "";
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
      if(elem.name === tab.name) {
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

    this.searchCustomer({
      ...this.queryParams(),
      typeValues: this.filterTabs.find(t => t.field === "typeValues")?.selectIds.join(",") || undefined,
    }, true);

  }


}
