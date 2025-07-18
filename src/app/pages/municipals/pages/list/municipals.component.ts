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
import * as RouterActions from "../../../../core/router/store/router.actions";
import { PartialMunicipal } from "../../../../models/Municipals";
import { Sort, Table, TableButton } from "../../../../models/Table";
import * as MunicipalsActions from "../../store/actions/municipals.actions";
import { getMunicipalsPaginate } from "../../store/selectors/municipals.selectors";

@Component({
  selector: 'app-municipals',
  standalone: true,
  imports: [ CommonModule, MatIconModule, TableComponent, TableSkeletonComponent, MatDialogModule, SearchComponent ],
  template: `
    <div class="grid gap-3">
      <app-search [search]="search"/>
      <div *ngIf="municipalPaginate$ | async as municipalPaginate else skeleton">
        <app-table
          [dataSource]="municipalPaginate"
          [columns]="columns"
          [displayedColumns]="displayedColumns"
          [paginator]="paginator"
          [buttons]="buttons"
          (onPageChange)="changePage($event)"
          (onPageSizeChange)="changePageSize($event)"
          (onSortChange)="changeSort($event)"/>
      </div>
    </div>


    <ng-template #cityRow let-row>
      <div>{{ row.city }}</div>
    </ng-template>

    <ng-template #provinceRow let-row>
      <div>{{ row.province }}</div>
    </ng-template>

    <ng-template #regionRow let-row>
      <div>{{ row.region }}</div>
    </ng-template>

    <ng-template #domainRow let-row>
      <div>{{ row.domain }}</div>
    </ng-template>

    <ng-template #skeleton>
      <app-table-skeleton [columns]="columns"/>
    </ng-template>
  `,
  styles: [ `` ]
})
export default class ActivitiesComponent implements AfterViewInit {
  @ViewChild("cityRow") cityRow: TemplateRef<any> | undefined;
  @ViewChild("provinceRow") provinceRow: TemplateRef<any> | undefined;
  @ViewChild("regionRow") regionRow: TemplateRef<any> | undefined;
  @ViewChild("domainRow") domainRow: TemplateRef<any> | undefined;

  store: Store<AppState> = inject(Store);
  municipalPaginate$ = this.store.select(getMunicipalsPaginate);
  dialog = inject(MatDialog);

  columns: any[] = [];
  displayedColumns: string[] = [];

  buttons: TableButton<PartialMunicipal>[] = [
    { iconName: "delete", bgColor: "red", callback: elem => this.openDialog(elem) },
    {
      iconName: "edit",
      bgColor: "orange",
      callback: elem => this.store.dispatch(RouterActions.go({ path: [ `municipals/${ elem.id }` ] }))
    },
  ];

  paginator: WritableSignal<Table> = signal({
    pageIndex: 0,
    pageSize: 10
  });

  sorter: WritableSignal<Sort[]> = signal([ { active: "city", direction: "asc" } ]);

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

  ngAfterViewInit() {

    Promise.resolve(null).then(() => {
      this.columns = [
        {
          columnDef: 'city',
          header: 'Città',
          width: "15rem",
          template: this.cityRow,
          sortable: true
        },
        {
          columnDef: 'province',
          header: 'Provincia',
          width: "5rem",
          template: this.provinceRow,
          sortable: true
        },
        {
          columnDef: 'region',
          header: 'Regione',
          width: "15rem",
          template: this.regionRow,
          sortable: true
        },
        {
          columnDef: 'domain',
          header: 'Dominio',
          width: "15rem",
          template: this.domainRow,
          sortable: true
        },
      ];
      this.displayedColumns = [ ...this.columns.map(c => c.columnDef), "actions" ];
    })
  }

  openDialog(municipal: PartialMunicipal) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData>{
        title: "Conferma rimozione",
        content: `
        Si sta eliminando il comune di ${ municipal.city }.
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
      this.deleteMunicipal(municipal);
    });
  }

  constructor() {
    effect(() => {
      const query: QuerySearch = {
        page: this.paginator().pageIndex,
        limit: this.paginator().pageSize,
        search: this.searchText()!,
        sort: this.sorterPayload()
      }

      this.store.dispatch(
        MunicipalsActions.loadMunicipalsPaginate({ query })
      );
    }, { allowSignalWrites: true })

    this.store.dispatch(
      MunicipalsActions.loadMunicipalsPaginate({ query: { page: 0, limit: 10 } })
    );
  }

  private deleteMunicipal(row: PartialMunicipal) {
    this.store.dispatch(MunicipalsActions.deleteMunicipal({ id: row.id! }));
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
