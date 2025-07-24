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
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { QuerySearch, SortSearch } from "../../../../../global";
import { AppState } from "../../../../app.config";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import { SearchComponent } from "../../../../components/search/search.component";
import { ShowImageComponent } from "../../../../components/show-image/show-image.component";
import { TableSkeletonComponent } from "../../../../components/skeleton/table-skeleton.component";
import { TableComponent } from "../../../../components/table/table.component";
import { getProfileMunicipalityId } from "../../../../core/profile/store/profile.selectors";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { Sort, Table, TableButton } from "../../../../models/Table";
import { PartialUser, Roles } from "../../../../models/User";
import * as UserActions from "../../../users/store/actions/users.actions";
import { getUsersPaginate } from "../../store/selectors/users.selectors";

@Component({
  selector: 'app-list-user',
  standalone: true,
  imports: [ CommonModule, MatIconModule, SearchComponent, TableComponent, TableSkeletonComponent, MatDialogModule, ShowImageComponent ],
  template: `
    <div class="grid gap-3">
      <app-search [search]="search"/>
      <div *ngIf="userPaginate$ | async as userPaginate else skeleton">
        <app-table
          [dataSource]="userPaginate"
          [columns]="columns"
          [displayedColumns]="displayedColumns"
          [paginator]="paginator"
          [buttons]="buttons"
          (onPageChange)="changePage($event)"
          (onPageSizeChange)="changePageSize($event)"
          (onSortChange)="changeSort($event)"/>
      </div>
    </div>


    <ng-template #imageRow let-row>
      <app-show-image classes="w-16 h-16" [imageUrl]="row.photo || ''" [objectName]="row.name"/>
    </ng-template>

    <ng-template #nameRow let-row>
      <div class="flex">
          <span *ngIf="!!row.name"
                class="inline-flex items-center px-2.5 py-0.5 rounded-md shadow-sm accent text-sm font-medium"
                href="row.email">
           {{ row.name }}
          </span>
      </div>

    </ng-template>

    <ng-template #surnameRow let-row>
      <div class="flex">
          <span *ngIf="!!row.name"
                class="inline-flex items-center px-2.5 py-0.5 rounded-md shadow-sm accent text-sm font-medium"
                href="row.email">
           {{ row.surname }}
          </span>
      </div>

    </ng-template>

    <ng-template #birthDateRow let-row>
      <div>{{ row.birthDate }}</div>
    </ng-template>

    <ng-template #rolesRow let-row>
      <div class="flex flex-wrap gap-1">
        <div *ngFor="let role of row.roles">
          <span
            class="whitespace-nowrap bg-gray-100 text-sm px-2.5 py-0.5 rounded">{{ role === Roles.ROLE_ADMIN ? 'ADMIN' : 'USER' }}</span>
        </div>
      </div>
    </ng-template>

    <ng-template #skeleton>
      <app-table-skeleton [columns]="columns"/>
    </ng-template>
  `,
  styles: []
})
export default class UsersComponent implements AfterViewInit {
  @ViewChild("imageRow") imageRow: TemplateRef<any> | undefined;
  @ViewChild("nameRow") nameRow: TemplateRef<any> | undefined;
  @ViewChild("surnameRow") surnameRow: TemplateRef<any> | undefined;
  @ViewChild("birthDateRow") birthDateRow: TemplateRef<any> | undefined;
  @ViewChild("rolesRow") rolesRow: TemplateRef<any> | undefined;

  store: Store<AppState> = inject(Store);
  userPaginate$ = this.store.select(getUsersPaginate);
  dialog = inject(MatDialog);

  columns: any[] = [];
  displayedColumns: string[] = [];

  buttons: TableButton<PartialUser>[] = [
    {
      iconName: "edit",
      bgColor: "orange",
      callback: elem => this.store.dispatch(RouterActions.go({ path: [ `users/${ elem.id }` ] }))
    },
    {
      iconName: "visibility",
      bgColor: "sky",
      callback: elem => this.store.dispatch(RouterActions.go({ path: [ `users/${ elem.id }/view` ] }))
    }
  ];

  paginator: WritableSignal<Table> = signal({
    pageIndex: 0,
    pageSize: 10
  });

  sorter: WritableSignal<Sort[]> = signal([ { active: "name", direction: "asc" } ]);

  sorterPayload: Signal<SortSearch> = computed(() =>
    this.sorter().reduce<SortSearch>((acc, { active, direction }) => {
      acc[active] = direction;
      return acc;
    }, {})
  );

  search = new FormControl("");
  searchText = toSignal(this.search.valueChanges.pipe(
    debounceTime(500),
    distinctUntilChanged(),
  ));

  municipalityId = this.store.selectSignal(getProfileMunicipalityId);

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
          width: "10rem",
          sortable: true
        },
        {
          columnDef: 'surname',
          header: 'Cognome',
          template: this.surnameRow,
          width: "10rem",
          sortable: true
        },
        {
          columnDef: 'birthDate',
          header: 'Data di Nascita',
          template: this.birthDateRow,
          width: "15rem",
          sortable: true
        },
        {
          columnDef: 'roles',
          header: 'Ruoli',
          template: this.rolesRow,
          width: "12rem",
          sortable: true
        },
      ];
      this.displayedColumns = [ ...this.columns.map(c => c.columnDef), "actions" ];
    })
  }

  openDialog(user: PartialUser) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData>{
        title: "Conferma rimozione",
        content: `
        Si sta eliminando il cliente ${ user.surname }.
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
      this.deleteUser(user);
    });
  }

  constructor() {
    // Questo effect viene triggerato ogni qual volta un dei signal presenti all'interno cambia di valore
    effect(() => {

      const municipalityId = this.municipalityId()

      if ( !municipalityId ) {
        return
      }

      const query: QuerySearch = {
        page: this.paginator().pageIndex,
        limit: this.paginator().pageSize,
        search: this.searchText()!,
        filters: { municipalityId },
        sort: this.sorterPayload()
      }

      this.store.dispatch(
        UserActions.loadPaginateUsers({ query })
      );
    }, { allowSignalWrites: true })
  }

  private deleteUser(row: PartialUser) {
    this.store.dispatch(UserActions.deleteUser({ id: row.id! }));
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
}
