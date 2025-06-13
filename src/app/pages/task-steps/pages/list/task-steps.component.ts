import { AfterContentInit, Component, effect, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { Subject } from "rxjs";
import { Query } from "../../../../../global";
import * as TaskStepsActions from "../../store/actions/task-steps.actions";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { getTaskStepsPaginatedDocs } from "../../store/selectors/task-steps.selectors";
import { getProfileUser } from "../../../../core/profile/store/profile.selectors";
import TaskStepComponent from "./components/task-step.component";
import { mapTaskStepType, TaskStepFilter, TaskStepStatus, TaskStepTable } from "../../../../models/TaskSteps";
import { FiltersComponent } from "../../../../components/filters/filters.component";
import { DateInterval, FilterElement, FilterOption } from "../../../../models/Filters";
import { toSignal } from "@angular/core/rxjs-interop";
import { selectRouteQueryParamParam } from "../../../../core/router/store/router.selectors";
import { createSortArray } from "../../../../../utils/utils";
import { Sort } from "../../../../models/Table";
import { regexISODate } from "../../../../components/filters/addons/date-options.component";
import { Roles } from "../../../../models/User";

@Component({
  selector: 'app-task-steps',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatTooltipModule, MatDialogModule, TaskStepComponent, FiltersComponent],
  template: `
    <div class="flex flex-col gap-2 h-full">
      <app-filters
        *ngIf="(taskStepsPaginatedDocs$ | async)?.length"
        [showFilter]="expandFilter"
        [filterTabs]="filterTabs"
        [showFilterNames]="true"
        [selectedDates]="selectedDates"
        class="sticky z-[101]"
        [ngClass]="{'mb-3': expandFilter}"
        (onRemoveFiltersFromSingleTab)="removeFiltersFromSingleTab($event)"
        (onRemovePickedDates)="removePickedDatesFromDatePicker($event)"
      />
      <div class="flex flex-wrap w-full gap-2.5" *ngIf="(taskStepsPaginatedDocs$ | async) as taskSteps">
        <app-task-step
          *ngFor="let taskStep of taskSteps"
          [taskStep]="taskStep"
          class="w-[34rem] h-80"
        />
      </div>
      <div class="flex flex-col h-full justify-center">
        <div *ngIf="!(taskStepsPaginatedDocs$ | async)?.length"
             class="text-4xl font-bold flex justify-center">
          Nessun lavoro in lista
        </div>
      </div>
    </div>
  `,
  styles: [`

  `]
})
export default class TaskStepsComponent implements AfterContentInit, OnInit {
  store: Store<AppState> = inject(Store);
  dialog = inject(MatDialog);
  subject = new Subject();


  taskStepsPaginatedDocs$ = this.store.select(getTaskStepsPaginatedDocs)
  currentUsers$ = this.store.select(getProfileUser);

  expandFilter: boolean = true;
  filterTabs: FilterElement[] = [];
  queryParams = toSignal(this.store.select(selectRouteQueryParamParam()));
  sorter: WritableSignal<Sort[]> = signal([{ active: "createdAt", direction: "desc" }]);

  intervalValues: number[] | undefined;
  includeNotAssigned: boolean = false;
  userId = signal<number>(0);
  roleNames = signal<Roles[]>([]);

  filters: Query<TaskStepFilter> = {
    query: {},
    options: {
      populate: "task.setup.inspection task.setup.customer user",
      limit: 20,
      page: 1,
      sort: [
        {
          createdAt: "asc",
        },
      ]
    }
  };

  selectedDates: DateInterval | undefined;

  ngOnInit() {
    this.searchTaskStep({
      ...this.queryParams(),
      users: undefined,
      includeNotAssigned: undefined,
    });
  }

  constructor() {
    this.currentUsers$.subscribe((user) => {
      if (!user || !user.roles?.length) return;
      this.userId.set(user.id!);
      this.roleNames.set(user.roles.map(role => role.roleName));
    });

    effect(() => {
      const userId = this.userId();

      const taskStepTypes= mapTaskStepType
        .filter(ts => this.roleNames().includes(ts.workerRole)) // Match workerRole with roleNames signal
        .map(ts => ts.value)

      if (!userId) return;
      const rawParams = this.queryParams();


      const params: TaskStepTable = {
        ...rawParams,
        includeNotAssigned: rawParams?.["includeNotAssigned"] === undefined ? true : rawParams["includeNotAssigned"] === 'true',
        users: rawParams?.["users"] === undefined ? [this.userId()] : rawParams["users"].map((id: number) => +id)
      };
      this.filters = {
        ...this.filters,
        query: {
          users: params.users,
          includeNotAssigned: params.includeNotAssigned === undefined ? true : params.includeNotAssigned,
          status: params.status?.length! > 0 ? params.status : [TaskStepStatus.WORKING, TaskStepStatus.PENDING],
          type: taskStepTypes,
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

      this.store.dispatch(TaskStepsActions.editTaskStepsFilter({ filters: this.filters }));

    }, { allowSignalWrites: true });
  }

  ngAfterContentInit() {

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
        field: "includeNotAssigned",
        name: "mostra",
        popUp: false,
        iconName: "plus",
        options: [
          { id: 1, name: "i miei", checked: false },
          { id: 2, name: "non assegnati", checked: false }
        ],
        selectIds: [],
        searcher: false,
        dateIntervalPicker: false,
        onSelectedTab: (tab: FilterElement) => this.onSelectedTab(tab),
        onSelectOption: (tabName: string, option: FilterOption) => this.onSelectedOption(tabName, option)
      },
      {
        field: "status",
        name: "stato",
        popUp: false,
        iconName: "plus",
        options: [
          { id: 1, name: "completati", checked: false },
          { id: 2, name: "in corso", checked: false }
        ],
        selectIds: [],
        searcher: false,
        dateIntervalPicker: false,
        onSelectedTab: (tab: FilterElement) => this.onSelectedTab(tab),
        onSelectOption: (tabName: string, option: FilterOption) => this.onSelectedOption(tabName, option)
      }
    ];
  }

  onSelectedTab(tab: FilterElement): void {
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

  searchTaskStep(payload: TaskStepTable, resetPageIndex?: boolean): void {
    if(resetPageIndex) {
      payload = { ...payload };
    }

    this.store.dispatch(RouterActions.go({ path: ["task-steps"], extras: { queryParams: payload } }));
  }

  onSelectedOption(tabField: string, option: FilterOption): void {

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
      if (id === 1) return [TaskStepStatus.DONE];
      if (id === 2) return [TaskStepStatus.WORKING];
      return [];
    }) ?? [];

    const selectedIds = this.filterTabs.find(ft => ft.field === "includeNotAssigned")?.selectIds;

    const getIncludeNotAssignedFilter = () => {
      if (selectedIds?.length === 1) {
        return selectedIds?.at(0) === 2;
      }

      return selectedIds?.length === 2 ? true : undefined;
    }

    const getUserIdDueToIncludeNotAssigned = () => {
      if (selectedIds?.length === 1) {
        return selectedIds?.at(0) === 2 ? [-1] : [this.userId()];
      }

      return undefined;
    }

    this.searchTaskStep({
      ...this.queryParams(),
      dueDateFrom: this.filterTabs.find(t => t.field === "dateInterval")?.pickedDateInterval?.from || undefined,
      dueDateTo: this.filterTabs.find(t => t.field === "dateInterval")?.pickedDateInterval?.to || undefined,
      status: selectedStatuses?.length! > 0 ? selectedStatuses : undefined,
      users: getUserIdDueToIncludeNotAssigned() ?? undefined,
      includeNotAssigned: getIncludeNotAssignedFilter() ?? undefined,
    }, true);
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

    this.searchTaskStep({
      ...this.queryParams(),
      users: this.queryParams()?.["users"],
      dueDateFrom: undefined,
      dueDateTo: undefined,
    }, true)
  }

}
