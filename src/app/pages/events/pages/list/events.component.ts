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
import { DateTime } from "luxon";
import { distinctUntilChanged } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { SortSearch } from "../../../../../global";
import { createSortArray } from "../../../../../utils/utils";
import { AppState } from "../../../../app.config";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import { SearchComponent } from "../../../../components/search/search.component";
import { TableSkeletonComponent } from "../../../../components/skeleton/table-skeleton.component";
import { TableComponent } from "../../../../components/table/table.component";
import { TagListComponent } from "../../../../components/tag-list/tag-list.component";
import { getProfileMunicipalityId } from "../../../../core/profile/store/profile.selectors";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { getEventTypeName, PartialEvent } from "../../../../models/Event";
import { Sort, Table, TableButton } from "../../../../models/Table";
import { Roles } from "../../../../models/User";
import * as EventActions from "../../../events/store/actions/events.actions";
import { getEventsPaginate } from "../../../events/store/selectors/events.selectors";

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [ CommonModule, MatIconModule, TableComponent, TableSkeletonComponent, MatDialogModule, SearchComponent, TagListComponent ],
  template: `
    <div class="grid gap-3">
      <app-search [search]="search"/>
      <div *ngIf="eventsPaginate$ | async as eventsPaginate else skeleton">
        <app-table
          [dataSource]="eventsPaginate"
          [columns]="columns"
          [displayedColumns]="displayedColumns"
          [paginator]="paginator"
          [buttons]="buttons"
          (onPageChange)="changePage($event)"
          (onPageSizeChange)="changePageSize($event)"
          (onSortChange)="changeSort($event)"/>
      </div>
    </div>


    <ng-template #titleRow let-row>
      <div>{{ row.title }}</div>
    </ng-template>

    <ng-template #descriptionRow let-row>
      <div>{{ row.description }}</div>
    </ng-template>

    <ng-template #typeRow let-row>
      <div class="flex flex-wrap gap-1">
        <span *ngIf="row.type"
              class="whitespace-nowrap bg-gray-100 text-sm me-2 px-2.5 py-0.5 rounded">
            {{ getEventTypeName(row.type) }}
          </span>
      </div>
    </ng-template>

    <ng-template #startDateTimeRow let-row>
      <div>{{ row.startDateTime ? (row.startDateTime | date: 'dd/MM/yyyy HH:mm') : '' }}</div>
    </ng-template>

    <ng-template #endDateTimeRow let-row>
      <div>{{ row.endDateTime ? (row.endDateTime | date: 'dd/MM/yyyy HH:mm') : '' }}</div>
    </ng-template>

    <ng-template #locationRow let-row>
      <div>{{ row.location }}</div>
    </ng-template>

    <ng-template #organizerRow let-row>
      <div>{{ row.organizer }}</div>
    </ng-template>

    <ng-template #tagsRow let-row let-i="index">
      <app-tag-list [row]="row.tags" [index]="i"/>
    </ng-template>

    <ng-template #skeleton>
      <app-table-skeleton [columns]="columns"/>
    </ng-template>
  `,
  styles: [ `` ]
})
export default class EventsComponent implements AfterViewInit {
  @ViewChild("titleRow") titleRow: TemplateRef<any> | undefined;
  @ViewChild("descriptionRow") descriptionRow: TemplateRef<any> | undefined;
  @ViewChild("typeRow") typeRow: TemplateRef<any> | undefined;
  @ViewChild("startDateTimeRow") startDateTimeRow: TemplateRef<any> | undefined;
  @ViewChild("endDateTimeRow") endDateTimeRow: TemplateRef<any> | undefined;
  @ViewChild("locationRow") locationRow: TemplateRef<any> | undefined;
  @ViewChild("organizerRow") organizerRow: TemplateRef<any> | undefined;
  @ViewChild("tagsRow") tagsRow: TemplateRef<any> | undefined;

  store: Store<AppState> = inject(Store);
  eventsPaginate$ = this.store.select(getEventsPaginate);
  dialog = inject(MatDialog);

  columns: any[] = [];
  displayedColumns: string[] = [];

  buttons: TableButton<PartialEvent>[] = [
    { iconName: "delete", bgColor: "red", callback: elem => this.openDialog(elem) },
    {
      iconName: "edit",
      bgColor: "orange",
      callback: elem => this.store.dispatch(RouterActions.go({ path: [ `events/${ elem.id }` ] }))
    },
    {
      iconName: "visibility",
      bgColor: "sky",
      callback: elem => this.store.dispatch(RouterActions.go({ path: [ `events/${ elem.id }/view` ] }))
    }
  ];

  paginator: WritableSignal<Table> = signal({
    pageIndex: 0,
    pageSize: 10
  });

  sorter: WritableSignal<Sort[]> = signal([ { active: "title", direction: "desc" } ]);

  search = new FormControl("");
  searchText = toSignal(this.search.valueChanges.pipe(
    debounceTime(250),
    distinctUntilChanged(),
  ));

  municipalityId = this.store.selectSignal(getProfileMunicipalityId);

  ngAfterViewInit() {

    Promise.resolve(null).then(() => {
      this.columns = [
        {
          columnDef: 'title',
          header: 'Titolo',
          width: "15rem",
          template: this.titleRow,
        },
        {
          columnDef: 'description',
          header: 'Descrizione',
          width: "15rem",
          template: this.descriptionRow,
        },
        {
          columnDef: 'type',
          header: 'Tipo',
          width: "15rem",
          template: this.typeRow,
        },
        {
          columnDef: 'startDateTime',
          header: 'Data di inizio',
          width: "15rem",
          template: this.startDateTimeRow,
        },
        {
          columnDef: 'endDateTime',
          header: 'Data di fine',
          width: "15rem",
          template: this.endDateTimeRow,
        },
        {
          columnDef: 'location',
          header: 'Luogo',
          width: "15rem",
          template: this.locationRow,
        },
        {
          columnDef: 'organizerRow',
          header: 'Organizzatore',
          width: "15rem",
          template: this.organizerRow,
        },
        {
          columnDef: 'tags',
          header: 'Tags',
          width: "15rem",
          template: this.tagsRow,
        },
      ];
      this.displayedColumns = [ ...this.columns.map(c => c.columnDef), "actions" ];
    })
  }

  openDialog(events: PartialEvent) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData>{
        title: "Conferma rimozione",
        content: `
        Si sta eliminando l'evento di nome ${ events.title }.
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
      this.deleteEvent(events);
    });
  }

  constructor() {
    effect(() => {
      const municipalityId = this.municipalityId();

      if (!municipalityId) {
        return;
      }

      const query = {
        page: this.paginator().pageIndex,
        limit: this.paginator().pageSize,
        search: this.searchText()!,
        filters: { municipalityId },
        sort: createSortArray(this.sorter()) as SortSearch<string, string>
      }

      this.store.dispatch(
        EventActions.loadPaginateEvents({
          query
        })
      );
    }, { allowSignalWrites: true })

  }

  private deleteEvent(row: PartialEvent) {
    this.store.dispatch(EventActions.deleteEvent({ id: row.id! }));
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

  protected readonly Roles = Roles;
  protected readonly DateTime = DateTime;
  protected readonly getEventTypeName = getEventTypeName;
}
