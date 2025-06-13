import { Component, effect, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SearchComponent } from "../../../../components/search/search.component";
import { FilterElement } from "../../../../models/Filters";
import InspectionCardComponent from "./inspection-card.component";
import { EventCalendarComponent } from "../../../../components/event-calendar/event-calendar.component";
import { Store} from "@ngrx/store";
import { AppState } from "../../../../app.config";
import {
  getAllInspections,
  getAllInspectionsFilter,
  getSelectiveInspectionFilter,
  getSelectiveInspections
} from "../../store/selectors/inspections.selectors";
import { MatDialog } from "@angular/material/dialog";
import { Subject } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";
import { selectRouteQueryParamParam } from "../../../../core/router/store/router.selectors";
import { QueryAll} from "../../../../../global";
import {
  Inspection,
  InspectionFilter,
  InspectionStatus,
  InspectionTable,
  mapInspectionStatus
} from "../../../../models/Inspection";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import * as InspectionActions from "../../../inspections/store/actions/inspections.actions";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { FiltersComponent } from "../../../../components/filters/filters.component";
import { IconCounterComponent } from "./icon-counter.component";
import { DateTime } from "luxon";
import { capitalizeFirstCharOfAString } from "../../../../../utils/utils";

@Component({
  selector: 'app-inspection-calendar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatTooltipModule, SearchComponent, InspectionCardComponent, EventCalendarComponent, FiltersComponent, IconCounterComponent],
  template: `
    <ng-container *ngIf="inspections$ | async as inspections">
      <div class="grid grid-rows-2 md:grid-cols-2 gap-2.5 w-full">
        <div class="flex flex-col gap-2.5 h-full">
          <app-event-calendar
            *ngIf="!!baseDate && !!selectedDay"
            (onCalendarChange)="manageMonthChange($event)"
            [template]="dateCardContent"
            [selectedDay]="selectedDay"
            [date]="baseDate"
          >
            <ng-template #dateCardContent let-value>
              <div class="grid grid-cols-1 w-16" *ngIf="getDateCounters(value, inspections, baseDate) as counters">
                <app-icon-counter *ngIf="!!counters.done" [content]="counters.done" [icon]="'circle'" [iconClass]="'text-done'"/>
                <app-icon-counter *ngIf="!!counters.accepted" [content]="counters.accepted" [icon]="'circle'" [iconClass]="'text-accepted'"/>
                <app-icon-counter *ngIf="!!counters.pending" [content]="counters.pending" [icon]="'circle'" [iconClass]="'text-pending'"/>
                <app-icon-counter *ngIf="!!counters.rejected" [content]="counters.rejected" [icon]="'close'" [iconClass]="'text-rejected'"/>
              </div>
            </ng-template>
          </app-event-calendar>

          <div class="flex flex-row justify-center gap-4 cursor-default select-none">
            <app-icon-counter class="cursor-pointer"  [content]="'confermati'" [icon]="'circle'" contentClass="text-[16px] {{getInspectionStatusFilterSelected('confermati')}}" [iconClass]="'text-accepted'" (click)="getInspectionsFilteredFromLegend('confermati')"/>
            <app-icon-counter class="cursor-pointer" [content]="'in attesa'" [icon]="'circle'" contentClass="text-[16px] {{getInspectionStatusFilterSelected('in attesa')}}" [iconClass]="'text-pending'" (click)="getInspectionsFilteredFromLegend('in attesa')"/>
            <app-icon-counter class="cursor-pointer" [content]="'completati'" [icon]="'circle'" contentClass="text-[16px] {{getInspectionStatusFilterSelected('completati')}}" [iconClass]="'text-done'" (click)="getInspectionsFilteredFromLegend('completati')"/>
            <app-icon-counter class="cursor-pointer" [content]="'rifiutati'" [icon]="'close'" contentClass="text-[16px] {{getInspectionStatusFilterSelected('rifiutati')}}" [iconClass]="'text-rejected'" (click)="getInspectionsFilteredFromLegend('rifiutati')"/>
          </div>
        </div>

        <div class="flex flex-col gap-2.5" *ngIf="selectedDay && selectedDay > 0 && baseDate">
          <div class="font-bold text-2xl">
            {{ selectedDayText }}
          </div>

          <div class="flex justify-between gap-2">
            <div (click)="toggleFilter()"
                 matTooltip="Filtri sopralluoghi"
                 [ngStyle]="{'background-color': expandFilter ? '#F2F2F2' : '#FFFFFF'}"
                 class="cursor-pointer w-10 rounded-md aspect-square flex font-bold shadow-md bg-foreground text-gray-900 text-sm focus:outline-none p-2">
              <mat-icon *ngIf="!expandFilter" class="material-symbols-rounded">filter_list</mat-icon>
              <mat-icon *ngIf="expandFilter" class="material-symbols-rounded">close</mat-icon>
            </div>
            <div class="grow">
              <app-search [search]="search"/>
            </div>
          </div>
          <app-filters *ngIf="expandFilter" [showFilter]="expandFilter" [filterTabs]="filterTabs"/>
          <ng-container *ngIf="selectiveInspections$ | async as selectiveInspections">
            <div *ngFor="let inspection of selectiveInspections" #list>
              <app-inspection-card [inspection]="inspection"/>
            </div>

            <div *ngIf="!selectiveInspections.length;" class="w-full text-center italic">
                Nessun sopralluogo trovato
            </div>
          </ng-container>
        </div>
      </div>
    </ng-container>
  `
})
export default class CalendarInspectionComponent implements OnInit {
  store: Store<AppState> = inject(Store);
  inspections$ = this.store.select(getAllInspections);
  inspectionsFilter$ = this.store.select(getAllInspectionsFilter);
  selectiveInspections$ = this.store.select(getSelectiveInspections);
  inspectionsSelectiveFilter$ = this.store.select(getSelectiveInspectionFilter);
  dialog = inject(MatDialog);
  subject = new Subject();

  queryParams = toSignal(this.store.select(selectRouteQueryParamParam()));

  paginator = signal({
    pageIndex: 0,
    pageSize: 10
  });

  search = new FormControl("");
  baseDate?: DateTime;
  selectedDay: number | undefined;

  expandFilter: boolean = false;
  filterTabs: FilterElement[] = [];

  inspectionStatus: WritableSignal<InspectionStatus[]> = signal([]);

  ngOnInit() {
    if(this.queryParams()) {
      this.expandFilter = true;
    }

    if((this.queryParams() as InspectionTable)?.search) {
      this.search.setValue((this.queryParams() as InspectionTable).search!, { emitEvent: false })
    }

    this.inspectionsFilter$
      .pipe(takeUntil(this.subject))
      .subscribe((val) => {
        this.baseDate = !!val?.query?.dateFrom ? DateTime.fromFormat(val.query.dateFrom.toString(), "yyyy-LL-dd") : DateTime.now().startOf("month");
      });

    this.inspectionsSelectiveFilter$
      .pipe(takeUntil(this.subject))
      .subscribe((val) => {
        this.selectedDay = !!val?.query?.dateFrom ? DateTime.fromFormat(val.query.dateFrom.toString(), "yyyy-LL-dd").day : -1;
      });

    this.search.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.subject)
    ).subscribe(res => {
      this.searchInspection({
        ...this.queryParams(),
        search: res || undefined,
      }, false);
    });
  }

  constructor() {
    effect(() => {

      const params = {
        ...this.queryParams(),
        inspectionStatus: this.inspectionStatus() ?? []
      } as InspectionTable;

      const dateFrom = (params?.dateFrom ? DateTime.fromFormat(params.dateFrom.toString() ?? "", "yyyy-LL-dd") : DateTime.now())
        .startOf("month");

      const inspectionsFilter: QueryAll<InspectionFilter> = {
        query: {
          dateFrom: dateFrom.toFormat("yyyy-LL-dd"),
          dateTo: params.dateTo ?? DateTime.now().endOf("month").toFormat("yyyy-LL-dd"),
          inspectionStatus: params.inspectionStatus
        },
      };

      // prevent reload of the monthly inspections
      if (!this.baseDate?.equals(dateFrom)) {
        this.store.dispatch(InspectionActions.editInspectionFilter({ filters: inspectionsFilter }));
      }

      if (!!params.selectedDay) {
        const selectiveInspectionsFilter: QueryAll<InspectionFilter> = {
          query: {
            value: params.search || "",
            dateFrom: dateFrom.set({day: params.selectedDay}).toFormat("yyyy-LL-dd"),
            dateTo: dateFrom.set({day: params.selectedDay}).endOf("day").toFormat("yyyy-LL-dd"),
            inspectionStatus: params.inspectionStatus
          },
          populate: "setup.customer user"
        };

        this.store.dispatch(InspectionActions.editSelectiveInspectionFilter({ filters: selectiveInspectionsFilter }));
      } else {
        this.store.dispatch(InspectionActions.resetSelectiveInspection());
      }

      if (params.inspectionStatus) {
        const inspectionsFilter: QueryAll<InspectionFilter> = {
          query: {
            ...params,
            inspectionStatus: params.inspectionStatus
          }
        }
        this.store.dispatch(InspectionActions.editInspectionFilter({ filters: inspectionsFilter }));
      }

    }, { allowSignalWrites: true });

  }

  get selectedDayText(): string {
    if(!this.baseDate) {
      return '';
    }
    this.baseDate.set({ day: this.selectedDay })
    return `${ this.selectedDay } ${ capitalizeFirstCharOfAString(this.baseDate.monthLong || '') } ${ this.baseDate.year }`;
  }

  searchInspection(payload: InspectionTable, resetPageIndex?: boolean): void {
    if(resetPageIndex) {
      payload = { ...payload, pageIndex: 0 };
    }

    this.store.dispatch(RouterActions.go({ path: ["inspections"], extras: { queryParams: payload } }));
  }

  manageMonthChange(calendarSpec: { selectedDay: number, baseDate: DateTime }) {
    this.searchInspection({
        ...this.queryParams(),
        dateFrom: calendarSpec.baseDate.startOf("month").toFormat("yyyy-LL-dd"),
        dateTo: calendarSpec.baseDate.endOf("month").toFormat("yyyy-LL-dd"),
        selectedDay: calendarSpec.selectedDay === -1 ? undefined : calendarSpec.selectedDay,
    }, false);
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

  getDateCounters(dayNumber: number, inspections: Inspection[], baseDate: DateTime) {
    const date = baseDate.set({ day: dayNumber }).startOf("day");

    const filteredInspections = inspections.filter((inspection) => {
      return date.equals(DateTime.fromISO(inspection.date as string).startOf("day"));
    });

    if(!filteredInspections.length) {
      return undefined;
    }

    return filteredInspections.reduce((previousValue, currentValue) => ({
      accepted: +(currentValue.inspectionStatus === InspectionStatus.ACCEPTED) + previousValue.accepted,
      pending: +(currentValue.inspectionStatus === InspectionStatus.PENDING) + previousValue.pending,
      rejected: +(currentValue.inspectionStatus === InspectionStatus.REJECTED) + previousValue.rejected,
      done: +(currentValue.inspectionStatus === InspectionStatus.DONE) + previousValue.done,
    }), { accepted: 0, pending: 0, rejected: 0, done: 0 })
  }

  getInspectionsFilteredFromLegend(legendLabel: string) {
    const inspectionStatus = mapInspectionStatus.find(is => is.legendLabel === legendLabel)?.value;
    if (!inspectionStatus) return;

    const current = this.inspectionStatus();
    let newInspectionStatuses: InspectionStatus[];

    if (current.includes(inspectionStatus)) {
      newInspectionStatuses = current.filter(status => status !== inspectionStatus);
    } else {
      newInspectionStatuses = [...current, inspectionStatus];
    }

    this.inspectionStatus.set(newInspectionStatuses);
  }

  getInspectionStatusFilterSelected(legendLabel: string) {
    const inspectionStatus = mapInspectionStatus.find(is => is.legendLabel === legendLabel)?.value;
    return this.inspectionStatus().includes(inspectionStatus!) ? 'underline' : '';
  }

}
