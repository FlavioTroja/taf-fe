import {
  AfterViewInit,
  Component, effect,
  inject, OnInit,
  signal,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  WritableSignal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { animate, style, transition, trigger } from "@angular/animations";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { MatTooltipModule } from "@angular/material/tooltip";
import {FiltersComponent} from "../../../../components/filters/filters.component";
import {SearchComponent} from "../../../../components/search/search.component";
import {TableComponent} from "../../../../components/table/table.component";
import {TableSkeletonComponent} from "../../../../components/skeleton/table-skeleton.component";
import {FilterElement, FilterOption} from "../../../../models/Filters";
import {Sort, TableButton} from "../../../../models/Table";
import {Store} from "@ngrx/store";
import {AppState} from "../../../../app.config";
import {Subject, takeUntil} from "rxjs";
import {getResourcesPaginate} from "../../store/selectors/resources.selector";
import * as RouterActions from "../../../../core/router/store/router.actions";
import {ModalComponent, ModalDialogData} from "../../../../components/modal/modal.component";
import {PartialResource, ResourceFilter, ResourceTable} from "../../../../models/Resource";
import * as ResourcesActions from "../../../resources/store/actions/resources.actions";
import {toSignal} from "@angular/core/rxjs-interop";
import {selectRouteQueryParamParam} from "../../../../core/router/store/router.selectors";
import {ShowImageComponent} from "../../../../components/show-image/show-image.component";
import {createSortArray} from "../../../../../utils/utils";
import {Query} from "../../../../../global";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";

@Component({
  selector: 'app-list-resources',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatOptionModule, FormsModule, ReactiveFormsModule, MatSelectModule, ClipboardModule, MatTooltipModule, FiltersComponent, SearchComponent, TableComponent, TableSkeletonComponent, ShowImageComponent],
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

      <div *ngIf="resourcesPaginate$ | async as resourcePaginate else skeleton">
        <app-table [dataSource]="resourcePaginate"
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
      </div>
    </ng-template>

    <ng-template #hourlyCostRow let-row>
      <div class="flex flex-col">
        <div>{{ row.hourlyCost }}</div>
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

export default class ResourcesComponent implements AfterViewInit, OnInit {
  @ViewChild("imageRow") imageRow: TemplateRef<any> | undefined;
  @ViewChild("nameRow") nameRow: TemplateRef<any> | undefined;
  @ViewChild("hourlyCostRow") hourlyCostRow: TemplateRef<any> | undefined;

  store: Store<AppState> = inject(Store);
  subject = new Subject();
  resourcesPaginate$ = this.store.select(getResourcesPaginate);
  dialog = inject(MatDialog);

  queryParams = toSignal(this.store.select(selectRouteQueryParamParam()));

  expandFilter: boolean = false;
  filterTabs: FilterElement[] = [];

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

  columns: any[] = [];
  displayedColumns: string[] = [];

  buttons: TableButton<PartialResource>[] = [
    { iconName: "delete", bgColor: "red", callback: elem => this.openDialog(elem) },
    { iconName: "edit", bgColor: "orange", callback: elem => this.store.dispatch(RouterActions.go({ path: [`resources/${elem.id}`] })) },
    { iconName: "visibility", bgColor: "sky", callback: elem => this.store.dispatch(RouterActions.go({ path: [`resources/${elem.id}/view`] })) },
  ];

  filters: Query<ResourceFilter> = {
    query: {},
    options: {
      populate: "",
      limit: this.paginator().pageSize,
      page: (this.paginator().pageIndex + 1),
      sort: createSortArray(this.sorter())
    }
  };

  searchResource(payload: ResourceTable, resetPageIndex?: boolean): void {
    if(resetPageIndex) {
      payload = { ...payload, pageIndex: 0 };
    }

    this.store.dispatch(RouterActions.go({ path: ["resources"], extras: { queryParams: payload } }));
  }

  updatePaginator({ pageIndex, pageSize }: { pageIndex: number, pageSize: number }) {
    this.paginator.update(() => ({ pageIndex, pageSize }));
  }

  changePage(evt: number): void {
    this.searchResource({
      ...this.queryParams(),
      pageIndex: evt - 1
    });
  }

  changePageSize(evt: number): void {
    this.searchResource({
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

  openDialog(resource: PartialResource) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData> {
        title: "Conferma rimozione",
        content: `
        Si sta eliminando la risorsa <b>${resource.name}</b>.
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
      this.deleteResource(resource);
    });
  }

  private deleteResource(row: PartialResource) {
    this.store.dispatch(ResourcesActions.deleteResource({ id: row.id! }));
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

    this.searchResource({
      ...this.queryParams(),
    }, true);

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
          columnDef: 'hourlyCost',
          header: 'Costo per ora',
          template: this.hourlyCostRow,
          width: "10rem",
          sortable: false
        }
      ];
      this.displayedColumns = [...this.columns.map(c => c.columnDef), "actions"];

    });
  }

  ngOnInit() {
    if(this.queryParams()) {
      this.expandFilter = true;
    }

    if((this.queryParams() as ResourceTable)?.search) {
      this.search.setValue((this.queryParams() as ResourceTable).search!, { emitEvent: false })
    }

    this.search.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.subject)
    ).subscribe(res => {
      this.searchResource({
        ...this.queryParams(),
        search: res || undefined,
      }, true);
    });
  }

  constructor() {

    effect(() => {

      const params = {
        ...this.queryParams()
      } as ResourceTable;

      this.filters = {
        ...this.filters,
        query: {
          value: params.search || "",
        },
        options: {
          populate: this.filters.options?.populate,
          limit: +params.pageSize! || 10,
          page: params.pageIndex ? (+params.pageIndex + 1) : 1,
          sort: createSortArray(this.sorter()),
        }
      };

      this.store.dispatch(ResourcesActions.editResourceFilter({ filters: this.filters }));
      this.updatePaginator({
        pageSize: +params.pageSize! || 10,
        pageIndex: params.pageIndex ? (+params.pageIndex) : 0,
      });

    }, { allowSignalWrites: true });

  }
}
