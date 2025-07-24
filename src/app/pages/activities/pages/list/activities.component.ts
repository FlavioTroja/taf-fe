import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  Signal,
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
import { AppState } from "../../../../app.config";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import { SearchComponent } from "../../../../components/search/search.component";
import { TableSkeletonComponent } from "../../../../components/skeleton/table-skeleton.component";
import { TableComponent } from "../../../../components/table/table.component";
import { TagListComponent } from "../../../../components/tag-list/tag-list.component";
import { getProfileMunicipalityId } from "../../../../core/profile/store/profile.selectors";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { getActivityTypeName, PartialActivity } from "../../../../models/Activities";
import { Sort, Table, TableButton } from "../../../../models/Table";
import * as ActivitiesActions from "../../store/actions/activities.actions";
import { getActivitiesPaginate } from "../../store/selectors/activities.selectors";
import { ShowImageComponent } from "../../../../components/show-image/show-image.component";

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [ CommonModule, MatIconModule, TableComponent, TableSkeletonComponent, MatDialogModule, SearchComponent, TagListComponent, ShowImageComponent ],
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

    <ng-template #coverRow let-row>
      <app-show-image (click)="goToEditOrView(row.id)"
                      [objectName2]="row.name"
                      classes="w-16 h-16 cursor-pointer"
                      [imageUrl]="row.cover || ''">
      </app-show-image>
    </ng-template>

    <ng-template #nameRow let-row>
      <div>{{ row.name }}</div>
    </ng-template>

    <ng-template #addressRow let-row>
      <div>{{ row.address }}</div>
    </ng-template>

    <ng-template #phoneRow let-row>
      <div>{{ row.phone }}</div>
    </ng-template>

    <ng-template #websiteRow let-row>
      <div>{{ row.website }}</div>
    </ng-template>

    <ng-template #openingHoursRow let-row let-i="index">
      <app-tag-list [row]="row.openingHours" [index]="i"/>
    </ng-template>

    <ng-template #typeRow let-row>
      <div class="flex flex-wrap gap-1">
        <span *ngIf="row.type"
              class="whitespace-nowrap bg-gray-100 text-sm me-2 px-2.5 py-0.5 rounded">
            {{ getActivityTypeName(row.type) }}
          </span>
      </div>
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
export default class ActivitiesComponent implements AfterViewInit {
  @ViewChild("coverRow") coverRow: TemplateRef<any> | undefined;
  @ViewChild("nameRow") nameRow: TemplateRef<any> | undefined;
  @ViewChild("addressRow") addressRow: TemplateRef<any> | undefined;
  @ViewChild("phoneRow") phoneRow: TemplateRef<any> | undefined;
  @ViewChild("websiteRow") websiteRow: TemplateRef<any> | undefined;
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

  goToEditOrView(id: string) {
    this.store.dispatch(RouterActions.go({ path: [ `activities/${ id }` ] }))
  }

  paginator: WritableSignal<Table> = signal({
    pageIndex: 0,
    pageSize: 10
  });

  sorter: WritableSignal<Sort[]> = signal([ { active: "name", direction: "asc" } ]);

  sorterPayload: Signal<SortSearch> = computed(() => this.sorter().reduce<SortSearch>((acc, { active, direction }) => {
    acc[active] = direction
    return acc;
  }, {}))

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
          columnDef: 'cover',
          header: 'Cover',
          width: "5rem",
          template: this.coverRow,
        },
        {
          columnDef: 'name',
          header: 'Nome',
          width: "15rem",
          template: this.nameRow,
          sortable: true
        },
        {
          columnDef: 'address',
          header: 'Indirizzo',
          width: "10rem",
          template: this.addressRow,
          sortable: true
        },
        {
          columnDef: 'phone',
          header: 'Telefono',
          width: "8rem",
          template: this.phoneRow,
          sortable: true
        },
        {
          columnDef: 'website',
          header: 'Sito',
          width: "15rem",
          template: this.websiteRow,
          sortable: true
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
          sortable: true
        },
        {
          columnDef: 'tags',
          header: 'Tags',
          width: "20rem",
          template: this.tagsRow,
          sortable: true
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
      if ( !result ) {
        return;
      }
      this.deleteActivity(activity);
    });
  }

  constructor() {
    // Questo effect viene triggerato ogni qual volta un dei signal presenti all'interno cambia di valore
    effect(() => {
      const municipalityId = this.municipalityId();

      if ( !municipalityId ) {
        return;
      }

      const query: QuerySearch = {
        page: this.paginator().pageIndex,
        limit: this.paginator().pageSize,
        search: this.searchText()!,
        filters: { municipalityId },
        sort: this.sorterPayload()
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

  protected readonly getActivityTypeName = getActivityTypeName;
}
