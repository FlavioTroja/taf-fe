import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
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
import { AppState } from "../../../../app.config";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import { TableSkeletonComponent } from "../../../../components/skeleton/table-skeleton.component";
import { TableComponent } from "../../../../components/table/table.component";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { PartialMunicipality } from "../../../../models/Municipalities";
import { Sort, Table, TableButton } from "../../../../models/Table";
import * as MunicipalitiesActions from "../../store/actions/municipalities.actions";
import { loadMunicipalities } from "../../store/actions/municipalities.actions";
import { getMunicipalitiesPaginate } from "../../store/selectors/municipalities.selectors";

@Component({
  selector: 'app-municipalities',
  standalone: true,
  imports: [ CommonModule, MatIconModule, TableComponent, TableSkeletonComponent, MatDialogModule ],
  template: `
    <div class="w-full" #widthDiv></div>
    <div class="grid gap-3">
      <div *ngIf="municipalitiesPaginate$ | async as municipalitiesPaginate else skeleton" class="pt-12">
        <app-table
          [dataSource]="municipalitiesPaginate"
          [columns]="columns"
          [displayedColumns]="displayedColumns"
          [paginator]="paginator"
          [buttons]="buttons"/>
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

    <ng-template #skeleton>
      <app-table-skeleton [columns]="columns"/>
    </ng-template>
  `,
  styles: [ `
    ::ng-deep app-table > div > div > table > thead > tr > th {
      top: 3rem !important;
    }
  ` ]
})
export default class MunicipalitiesComponent implements AfterViewInit {
  @ViewChild("cityRow") cityRow: TemplateRef<any> | undefined;
  @ViewChild("provinceRow") provinceRow: TemplateRef<any> | undefined;
  @ViewChild("regionRow") regionRow: TemplateRef<any> | undefined;
  @ViewChild("widthDiv") widthDiv!: ElementRef;

  store: Store<AppState> = inject(Store);
  municipalitiesPaginate$ = this.store.select(getMunicipalitiesPaginate);
  dialog = inject(MatDialog);

  columns: any[] = [];
  displayedColumns: string[] = [];
  maxWidth: string = '';

  buttons: TableButton<PartialMunicipality>[] = [
    { iconName: "delete", bgColor: "red", callback: elem => this.openDialog(elem) },
    {
      iconName: "edit",
      bgColor: "orange",
      callback: elem => this.store.dispatch(RouterActions.go({ path: [ `municipalities/${ elem.id }` ] }))
    },
  ];

  paginator: WritableSignal<Table> = signal({
    pageIndex: 0,
    pageSize: 10
  });

  sorter: WritableSignal<Sort[]> = signal([ { active: "createdAt", direction: "desc" } ]);

  search = new FormControl("");
  searchText = toSignal(this.search.valueChanges.pipe(
    debounceTime(250),
    distinctUntilChanged(),
  ));

  resizeObserver = new ResizeObserver(() => {
    this.maxWidth = `${ this.widthDiv.nativeElement.offsetWidth }px`;
  });

  ngAfterViewInit() {
    this.resizeObserver.observe(this.widthDiv.nativeElement);

    Promise.resolve(null).then(() => {
      this.columns = [
        {
          columnDef: 'city',
          header: 'Città',
          width: "5rem",
          template: this.cityRow,
        },
        {
          columnDef: 'province',
          header: 'Provincia',
          width: "10rem",
          template: this.provinceRow,
        },
        {
          columnDef: 'region',
          header: 'Regione',
          width: "10rem",
          template: this.regionRow,
        },
      ];
      this.displayedColumns = [ ...this.columns.map(c => c.columnDef), "actions" ];
    })
  }

  openDialog(municipality: PartialMunicipality) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData>{
        title: "Conferma rimozione",
        content: `
        Si sta eliminando il comune ${ municipality.city }.
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
      this.deleteUser(municipality);
    });
  }

  constructor() {
    this.store.dispatch(loadMunicipalities())

  }

  private deleteUser(row: PartialMunicipality) {
    this.store.dispatch(MunicipalitiesActions.deleteMunicipalities({ id: row.id! }));
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
