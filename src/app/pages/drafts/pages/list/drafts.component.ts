import {
  AfterContentInit,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  WritableSignal
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { DateInterval, FilterElement, FilterOption } from "../../../../models/Filters";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { combineLatest, map, of, Subject } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";
import { selectRouteQueryParamParam } from "../../../../core/router/store/router.selectors";
import { Sort } from "../../../../models/Table";
import { Query } from "../../../../../global";
import { createSortArray } from "../../../../../utils/utils";
import { SetupFilter, SetupStatus, SetupTable } from "../../../../models/Setup";
import { debounceTime, distinctUntilChanged, exhaustMap, filter, takeUntil } from "rxjs/operators";
import * as RouterActions from "../../../../core/router/store/router.actions";
import * as DraftsActions from "../../../../pages/drafts/store/actions/drafts.actions";
import { getSetupsPaginate } from "../../store/selectors/drafts.selectors";
import { SearchComponent } from "../../../../components/search/search.component";
import { FiltersComponent } from "../../../../components/filters/filters.component";
import { DraftCardComponent } from "./components/draft-card.component";
import { PaginationComponent } from "../../../../components/pagination/pagination.component";
import { CustomersService } from "../../../customers/services/customers.service";
import { regexISODate } from "../../../../components/filters/addons/date-options.component";
import { MatSelectChange } from "@angular/material/select";

@Component({
  selector: 'app-drafts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatTooltipModule, MatDialogModule, SearchComponent, FiltersComponent, DraftCardComponent, PaginationComponent],
  template: `
    <div class="flex flex-col w-full gap-2.5" *ngIf="setUpsPaginate$ | async as dataSource">
      <div class="flex justify-between gap-2">
        <div (click)="toggleFilter()"
             matTooltip="Filtri schede tecniche"
             [ngStyle]="{'background-color': expandFilter ? '#F2F2F2' : '#FFFFFF'}"
             class="cursor-pointer w-10 rounded-md aspect-square flex font-bold shadow-md bg-foreground text-gray-900 text-sm focus:outline-none p-2">
          <mat-icon *ngIf="!expandFilter" class="material-symbols-rounded">filter_list</mat-icon>
          <mat-icon *ngIf="expandFilter" class="material-symbols-rounded">close</mat-icon>
        </div>
        <div class="grow">
          <app-search [search]="search"/>
        </div>
      </div>

      <app-filters
        *ngIf="expandFilter"
        [showFilter]="expandFilter"
        [filterTabs]="filterTabs"
        [showFilterNames]="true"
        [selectedDates]="selectedDates"
        (onRemoveFiltersFromSingleTab)="removeFiltersFromSingleTab($event)"
        (onRemovePickedDates)="removePickedDatesFromDatePicker($event)"
      />

      <app-draft-card
        *ngFor="let setup of dataSource.docs"
        [setup]="setup"
      />

      <app-pagination [paginator]="paginator()"
                      [paginateResults]="dataSource!"
                      (pageSizeToEmit)="getNewSelectedPageSize($event)"
                      (valueToEmit)="changePage($event)"
                      class="sticky bottom-[-4px] z-10"
      />
    </div>
  `,
  styles: [`

  `]
})
export default class DraftsComponent implements OnInit, AfterContentInit {
  store: Store<AppState> = inject(Store);
  dialog = inject(MatDialog);
  subject = new Subject();
  customersService = inject(CustomersService);

  search = new FormControl("");
  filterTabs: FilterElement[] = [];

  // Temporary ref until real paginator mockup (Remember to reset to this: (getAllSetups))
  setUpsPaginate$ = this.store.select(getSetupsPaginate);

  expandFilter: boolean = false;

  defaultFilterOptions = { page: 1, limit: 40 };

  isForCompletedTasks = window.location.pathname.includes("/completed");

  setupStatus = this.isForCompletedTasks ? [SetupStatus.DONE] : [SetupStatus.DRAFT, SetupStatus.QUOTE, SetupStatus.CANCELED];

  queryParams = toSignal(this.store.select(selectRouteQueryParamParam()));

  paginator = signal({
    pageIndex: 0,
    pageSize: 10
  });

  sorter: WritableSignal<Sort[]> = signal([{ active: "createdAt", direction: "desc" }]);

  filters: Query<SetupFilter> = {
    query: {},
    options: {
      populate: "customer inspection.user",
      limit: this.paginator().pageSize,
      page: (this.paginator().pageIndex + 1),
      sort: createSortArray(this.sorter())
    }
  };

  customers$ = this.customersService.loadCustomers({ query: {}, options: this.defaultFilterOptions }).pipe(
    map(c => c.docs.map(c => ({ id: c.id, name: c.name, checked: false })))
  );

  customersIds: number[] | undefined;
  setupsQuotesIds: number[] | undefined;
  intervalValues: number[] | undefined;

  selectedDates: DateInterval | undefined;

  ngOnInit() {
    this.search.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.subject)
    ).subscribe(res => {
      this.searchSetUp({
        ...this.queryParams(),
        search: res || undefined,
      }, true);
    });
  }

  constructor() {
    effect(() => {

      const params = {
        ...this.queryParams()
      } as SetupTable;

      this.customersIds = params.customers?.split(",").map(c => +c);

      this.filters = {
        ...this.filters,
        query: {
          value: params.search || "",
          customers: params.customers?.split(",").map(c => +c) ?? [],
          setupStatus: params.status ?? this.setupStatus,
          dueDateFrom: regexISODate.test(params.dueDateFrom as string)  ? params.dueDateFrom : undefined,
          dueDateTo: regexISODate.test(params.dueDateTo as string)    ? params.dueDateTo : undefined
        },
        options: {
          populate: this.filters.options?.populate,
          limit: +params.pageSize! || 10,
          page: params.pageIndex ? (+params.pageIndex + 1) : 1,
          sort: createSortArray(this.sorter())
        }
      };

      this.store.dispatch(DraftsActions.editSetupsFilter({ filters: this.filters }));
      this.updatePaginator({
        pageSize: +params.pageSize! || 10,
        pageIndex: params.pageIndex ? (+params.pageIndex) : 0,
      });

    }, { allowSignalWrites: true });
  }

  ngAfterContentInit() {
    combineLatest([
      this.customers$
    ]).pipe(
      takeUntil(this.subject)
    ).subscribe(([customers]) => {
      this.filterTabs = [
        {
          field: "dateInterval",
          name: "scadenza",
          popUp: false,
          iconName: "plus",
          options: [],
          selectIds: this.intervalValues || [],
          searcher: false,
          datePicker: true,
          dateIntervalPicker: true,
          onSelectedTab: (tab: FilterElement) => this.onSelectedTab(tab),
          onSelectOption: (tabName: string, option: FilterOption) => { this.onSelectedOption(tabName, option) }
        },
        {
          field: "customers",
          name: "clienti",
          options: customers.map(c => ({...c, checked: !!this.customersIds?.includes(c.id)}))
            .sort((a, b) => Number(b.checked) - Number(a.checked)),
          popUp: false,
          iconName: "plus",
          selectIds: this.customersIds ?? [],
          searcher: true,
          searchValue: new FormControl(""),
          onSelectedTab: (tab: FilterElement) => this.onSelectedTab(tab),
          onSelectOption: (tabName: string, option: FilterOption) => this.onSelectedOption(tabName, option)
        },
        {
          field: "status",
          name: "stato",
          options: [
            { id: 1, name: "bozza", checked: false },
            { id: 2, name: "preventivo", checked: false },
            { id: 3, name: "annullato", checked: false }
          ],
          popUp: false,
          iconName: "plus",
          selectIds: [],
          searcher: false,
          searchValue: new FormControl(""),
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
  }

  updatePaginator({ pageIndex, pageSize }: { pageIndex: number, pageSize: number }) {
    this.paginator.update(() => ({ pageIndex, pageSize }));
  }

  changePage(evt: number): void {
    this.searchSetUp({
      ...this.queryParams(),
      pageIndex: evt - 1
    });
  }

  getNewSelectedPageSize(page: MatSelectChange) {
    this.searchSetUp({
      ...this.queryParams(),
      pageSize: +page.value
    })
  }

  searchSetUp(payload: SetupTable, resetPageIndex?: boolean): void {
    if(resetPageIndex) {
      payload = { ...payload };
    }

    this.store.dispatch(RouterActions.go({ path: ["drafts"], extras: { queryParams: payload } }));
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
        // If filter has DatePicker
        if(elem.datePicker) {
          elem.selectIds = [];

          if(!option.checked) {
            elem.pickedDateInterval = undefined;
          }

          if(option.checked) {
            elem.pickedDateInterval = option.dateInterval;
            elem.selectIds = [ ...elem.selectIds, option.id ];
            this.selectedDates = option.dateInterval;
            return elem;
          }

          elem.selectIds = elem.selectIds.filter(id => id !== option.id);
          elem.pickedDateInterval = undefined;
          return elem;
        }

        if(!option.checked) {
          elem.selectIds = [ ...elem.selectIds, option.id ];
          return elem;
        }
        elem.selectIds = elem.selectIds.filter(id => id !== option.id);
      }
      return elem;
    });

    const selectedStatuses = this.filterTabs.find(ft => ft.field === "status")?.selectIds.flatMap(id => {
      if (id === 1) return [SetupStatus.DRAFT];
      if (id === 2) return [SetupStatus.QUOTE]
      if (id === 3) return [SetupStatus.CANCELED];
      return [];
    }) ?? [];

    this.searchSetUp({
      ...this.queryParams(),
      dueDateFrom: this.filterTabs.find(t => t.field === "dateInterval")?.pickedDateInterval?.from || undefined,
      dueDateTo: this.filterTabs.find(t => t.field === "dateInterval")?.pickedDateInterval?.to || undefined,
      customers: this.filterTabs.find(t => t.field === "customers")?.selectIds.join(",") || undefined,
      status: selectedStatuses?.length! > 0 ? selectedStatuses : undefined,
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
        // Customers
        if(field === "customers") {
          return this.customersService.loadCustomers({ query: { value: text }, options: this.defaultFilterOptions }).pipe(
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

  toggleFilter(): void {
    this.expandFilter = !this.expandFilter;

    if(!this.expandFilter) {
      this.filterTabs.forEach(tab => {
        tab.options.forEach(o => {
          if(o.checked) {
            // this.onSelectedOption(tab.field, o);
            o.checked = false;
          }
        })
      });
    }
  }

  removeFiltersFromSingleTab(tabField: string): void {
    this.expandFilter = !this.expandFilter;

    if(!this.expandFilter) {

      this.filterTabs.forEach(tab => {
        if(tab.field === tabField) {
          tab.options.forEach(o => {
            if(o.checked || tab.datePicker) {
              this.onSelectedOption(tab.field, o);
              o.checked = false;
            }
          });
        }
      });

    }
  }

  removePickedDatesFromDatePicker(tab: FilterElement) {
    this.filterTabs = this.filterTabs.map(elem =>
      elem.field === tab.field ? tab : elem
    );

    this.searchSetUp({
      ...this.queryParams(),
      dueDateFrom: undefined,
      dueDateTo: undefined,
    }, true)
  }
}
