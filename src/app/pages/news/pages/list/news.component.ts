import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, signal, TemplateRef, ViewChild, WritableSignal } from '@angular/core';
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl } from "@angular/forms";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { Store } from "@ngrx/store";
import { distinctUntilChanged } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { AppState } from "../../../../app.config";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import { SearchComponent } from "../../../../components/search/search.component";
import { TableSkeletonComponent } from "../../../../components/skeleton/table-skeleton.component";
import { TableComponent } from "../../../../components/table/table.component";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { PartialNews } from "../../../../models/News";
import { Sort, Table, TableButton } from "../../../../models/Table";
import * as NewsActions from "../../store/actions/news.actions";
import { loadNews } from "../../store/actions/news.actions";
import { getNewsPaginate } from "../../store/selectors/news.selectors";

@Component({
  selector: 'app-edits',
  standalone: true,
  imports: [ CommonModule, MatIconModule, TableComponent, TableSkeletonComponent, MatDialogModule, SearchComponent ],
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
      <div>{{ row.publicationDate }}</div>
    </ng-template>

    <ng-template #tagsRow let-row>
      <div>{{ row.tags }}</div>
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
          columnDef: 'title',
          header: 'Titolo',
          width: "10rem",
          template: this.titleRow,
        },
        {
          columnDef: 'content',
          header: 'Contenuto',
          width: "10rem",
          template: this.contentRow,
        },
        {
          columnDef: 'author',
          header: 'Autore',
          width: "10rem",
          template: this.authorRow,
        },
        {
          columnDef: 'publicationDate',
          header: 'Data di Pubblicazione',
          width: "10rem",
          template: this.publicationDateRow,
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

  openDialog(news: PartialNews) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData>{
        title: "Conferma rimozione",
        content: `
        Si sta eliminando l'attività di nome ${ news.title }.
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
      this.deleteNews(news);
    });
  }

  constructor() {
    this.store.dispatch(loadNews())

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
}
