import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  effect,
  inject,
  signal,
  TemplateRef,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl } from "@angular/forms";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { Store } from "@ngrx/store";
import { distinctUntilChanged } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { QuerySearch, SortSearch } from "../../../../../global";
import { createSortArray } from "../../../../../utils/utils";
import { AppState } from "../../../../app.config";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import { SearchComponent } from "../../../../components/search/search.component";
import { TableSkeletonComponent } from "../../../../components/skeleton/table-skeleton.component";
import { TableComponent } from "../../../../components/table/table.component";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { PartialActivity } from "../../../../models/Activities";
import { Sort, Table, TableButton } from "../../../../models/Table";
import * as ActivitiesActions from "../../store/actions/activities.actions";
import { getActivitiesPaginate } from "../../store/selectors/activities.selectors";

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [ CommonModule, MatIconModule, TableComponent, TableSkeletonComponent, MatDialogModule, SearchComponent ],
  template: `
    <div class="grid gap-3">
      <app-search [search]="search"/>
      <div *ngIf="activitiesPaginate$ | async as activitiesPaginate else skeleton">
        <app-table
          [dataSource]="activitiesPaginate"
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
      <div>{{ row.name }}</div>
    </ng-template>

    <ng-template #addressRow let-row>
      <div>{{ row.address }}</div>
    </ng-template>

    <ng-template #phoneRow let-row>
      <div>{{ row.phone }}</div>
    </ng-template>

    <ng-template #emailRow let-row>
      <div>{{ row.email }}</div>
    </ng-template>

    <ng-template #openingHoursRow let-row>
      <div class="flex flex-wrap gap-1">
        <div class="gap-1" *ngFor="let hour of row.openingHours">
          <span
            class="whitespace-nowrap bg-gray-100 text-sm me-2 px-2.5 py-0.5 rounded">{{ hour }}</span>
        </div>
      </div>
    </ng-template>

    <ng-template #typeRow let-row>
      <div class="flex flex-wrap gap-1">
        <span
          class="whitespace-nowrap bg-gray-100 text-sm me-2 px-2.5 py-0.5 rounded">
            {{ row.type }}
          </span>
      </div>
    </ng-template>

    <ng-template #tagsRow let-row>
      <div class="flex flex-wrap gap-1">
        <div class="gap-1" *ngFor="let tag of row.tags">
          <span
            class="whitespace-nowrap bg-gray-100 text-sm me-2 px-2.5 py-0.5 rounded">{{ tag }}</span>
        </div>
      </div>
    </ng-template>

    <ng-template #skeleton>
      <app-table-skeleton [columns]="columns"/>
    </ng-template>
  `,
  styles: [ `` ]
})
export default class ActivitiesComponent implements AfterViewInit {
  @ViewChild("nameRow") nameRow: TemplateRef<any> | undefined;
  @ViewChild("addressRow") addressRow: TemplateRef<any> | undefined;
  @ViewChild("phoneRow") phoneRow: TemplateRef<any> | undefined;
  @ViewChild("emailRow") emailRow: TemplateRef<any> | undefined;
  @ViewChild("openingHoursRow") openingHoursRow: TemplateRef<any> | undefined;
  @ViewChild("typeRow") typeRow: TemplateRef<any> | undefined;
  @ViewChild("tagsRow") tagsRow: TemplateRef<any> | undefined;

  store: Store<AppState> = inject(Store);
  activitiesPaginate$ = this.store.select(getActivitiesPaginate);
  dialog = inject(MatDialog);

  columns: any[] = [];
  displayedColumns: string[] = [];

  buttons: TableButton<PartialActivity>[] = [
    { iconName: "delete", bgColor: "red", callback: elem => this.openDialog(elem) },
    {
      iconName: "edit",
      bgColor: "orange",
      callback: elem => this.store.dispatch(RouterActions.go({ path: [ `activities/${ elem.id }` ] }))
    },
    {
      iconName: "visibility",
      bgColor: "sky",
      callback: elem => this.store.dispatch(RouterActions.go({ path: [ `activities/${ elem.id }/view` ] }))
    }
  ];

  paginator: WritableSignal<Table> = signal({
    pageIndex: 0,
    pageSize: 10
  });

  sorter: WritableSignal<Sort[]> = signal([ { active: "name", direction: "desc" } ]);

  search = new FormControl("");
  searchText = toSignal(this.search.valueChanges.pipe(
    debounceTime(250),
    distinctUntilChanged(),
  ));

  ngAfterViewInit() {

    Promise.resolve(null).then(() => {
      this.columns = [
        {
          columnDef: 'name',
          header: 'Nome',
          width: "15rem",
          template: this.nameRow,
        },
        {
          columnDef: 'address',
          header: 'Indirizzo',
          width: "10rem",
          template: this.addressRow,
        },
        {
          columnDef: 'phone',
          header: 'Telefono',
          width: "8rem",
          template: this.phoneRow,
        },
        {
          columnDef: 'email',
          header: 'Email',
          width: "15rem",
          template: this.emailRow,
        },
        {
          columnDef: 'openingHours',
          header: 'Orari di Apertura',
          width: "15rem",
          template: this.openingHoursRow,
        },
        {
          columnDef: 'type',
          header: 'Tipo',
          width: "10rem",
          template: this.typeRow,
        },
        {
          columnDef: 'tags',
          header: 'Tags',
          width: "10rem",
          template: this.tagsRow,
        },
      ];
      this.displayedColumns = [ ...this.columns.map(c => c.columnDef), "actions" ];
    })
  }

  openDialog(activity: PartialActivity) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData>{
        title: "Conferma rimozione",
        content: `
        Si sta eliminando l'attività di nome ${ activity.name }.
        <br>
        Questa operazione non è reversibile.
        `,
        buttons: [
          { iconName: "delete", label: "Elimina", bgColor: "remove", onClick: () => dialogRef.close(true) },
          { iconName: "clear", label: "Annulla", onClick: () => dialogRef.close(false) }
        ]
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (!result) {
        return;
      }
      this.deleteActivity(activity);
    });
  }

  constructor() {
    // Questo effect viene triggerato ogni qual volta un dei signal presenti all'interno cambia di valore
    effect(() => {
      const query: QuerySearch = {
        page: this.paginator().pageIndex,
        limit: this.paginator().pageSize,
        search: this.searchText()!,
        sort: createSortArray(this.sorter()) as SortSearch
      }

      this.store.dispatch(
        ActivitiesActions.loadActivities({ query })
      );
    }, { allowSignalWrites: true })
  }

  private deleteActivity(row: PartialActivity) {
    this.store.dispatch(ActivitiesActions.deleteActivity({ id: row.id! }));
  }

  changePage(evt: number) {
    this.paginator
      .update((curr) => ({ ...curr, pageIndex: evt - 1 }));
  }

  changePageSize(evt: number) {
    this.paginator
      .update((curr) => ({ ...curr, pageSize: evt, pageIndex: 0 }));
  }

  changeSort(evt: Sort) {
    this.sorter.mutate(value => {
      value[0] = (evt?.direction === "asc" || evt?.direction === "desc" ? evt : {} as Sort);
    });
  }
}
