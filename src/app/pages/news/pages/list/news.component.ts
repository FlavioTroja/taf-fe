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
import { DateTime } from "luxon";
import { distinctUntilChanged } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { AppState } from "../../../../app.config";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import { SearchComponent } from "../../../../components/search/search.component";
import { TableSkeletonComponent } from "../../../../components/skeleton/table-skeleton.component";
import { TableComponent } from "../../../../components/table/table.component";
import { TagListComponent } from "../../../../components/tag-list/tag-list.component";
import { getProfileMunicipalityId } from "../../../../core/profile/store/profile.selectors";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { PartialNews } from "../../../../models/News";
import { Sort, Table, TableButton } from "../../../../models/Table";
import { Roles } from "../../../../models/User";
import * as NewsActions from "../../store/actions/news.actions";
import { getNewsPaginate } from "../../store/selectors/news.selectors";
import { SortSearch } from "../../../../../global";

@Component({
  selector: 'app-edits',
  standalone: true,
  imports: [ CommonModule, MatIconModule, TableComponent, TableSkeletonComponent, MatDialogModule, SearchComponent, TagListComponent ],
  template: `
    <div class="grid gap-3">
      <app-search [search]="search"/>
      <div *ngIf="newsPaginate$ | async as newsPaginate else skeleton">
        <app-table
          [dataSource]="newsPaginate"
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

    <ng-template #contentRow let-row>
      <div>{{ row.content }}</div>
    </ng-template>

    <ng-template #authorRow let-row>
      <div>{{ row.author }}</div>
    </ng-template>

    <ng-template #publicationDateRow let-row>
      <div>{{ row.publicationDate ? (row.publicationDate | date: 'dd/MM/yyyy HH:mm') : '' }}</div>
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
export default class NewsComponent implements AfterViewInit {
  @ViewChild("titleRow") titleRow: TemplateRef<any> | undefined;
  @ViewChild("contentRow") contentRow: TemplateRef<any> | undefined;
  @ViewChild("authorRow") authorRow: TemplateRef<any> | undefined;
  @ViewChild("publicationDateRow") publicationDateRow: TemplateRef<any> | undefined;
  @ViewChild("tagsRow") tagsRow: TemplateRef<any> | undefined;

  store: Store<AppState> = inject(Store);
  newsPaginate$ = this.store.select(getNewsPaginate);
  dialog = inject(MatDialog);

  columns: any[] = [];
  displayedColumns: string[] = [];

  buttons: TableButton<PartialNews>[] = [
    { iconName: "delete", bgColor: "red", callback: elem => this.openDialog(elem) },
    {
      iconName: "edit",
      bgColor: "orange",
      callback: elem => this.store.dispatch(RouterActions.go({ path: [ `news/${ elem.id }` ] }))
    },
    {
      iconName: "visibility",
      bgColor: "sky",
      callback: elem => this.store.dispatch(RouterActions.go({ path: [ `news/${ elem.id }/view` ] }))
    }
  ];

  paginator: WritableSignal<Table> = signal({
    pageIndex: 0,
    pageSize: 10
  });

  sorter: WritableSignal<Sort[]> = signal([ { active: "title", direction: "asc" } ]);

  sorterPayload: Signal<SortSearch> = computed(() =>
    this.sorter().reduce<SortSearch>((acc, { active, direction }) => {
      acc[active] = direction;
      return acc;
    }, {})
  );

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
          sortable: true
        },
        {
          columnDef: 'content',
          header: 'Contenuto',
          width: "15rem",
          template: this.contentRow,
          sortable: true
        },
        {
          columnDef: 'author',
          header: 'Autore',
          width: "15rem",
          template: this.authorRow,
          sortable: true
        },
        {
          columnDef: 'publicationDate',
          header: 'Data di Pubblicazione',
          width: "15rem",
          template: this.publicationDateRow,
          sortable: true
        },
        {
          columnDef: 'tags',
          header: 'Tags',
          width: "15rem",
          template: this.tagsRow,
          sortable: true
        },
      ];
      this.displayedColumns = [ ...this.columns.map(c => c.columnDef), "actions" ];
    })
  }

  openDialog(news: PartialNews) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData>{
        title: "Conferma rimozione",
        content: `
        Si sta eliminando la news di nome ${ news.title }.
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
      this.deleteNews(news);
    });
  }

  constructor() {
    effect(() => {
      const municipalityId = this.municipalityId();

      if ( !municipalityId ) {
        return;
      }

      const query = {
        page: this.paginator().pageIndex,
        limit: this.paginator().pageSize,
        search: this.searchText()!,
        filters: { municipalityId },
        sort: this.sorterPayload()
      }

      this.store.dispatch(
        NewsActions.loadPaginateNews({
          query
        })
      );
    }, { allowSignalWrites: true })

  }

  private deleteNews(row: PartialNews) {
    this.store.dispatch(NewsActions.deleteNews({ id: row.id! }));
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
}
