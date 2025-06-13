import { Component, effect, inject, signal, TemplateRef, ViewChild, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { SearchComponent } from "../../../../components/search/search.component";
import { TableComponent } from "../../../../components/table/table.component";
import { TableSkeletonComponent } from "../../../../components/skeleton/table-skeleton.component";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { getUsersPaginate } from "../../store/selectors/users.selectors";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { Sort, Table, TableButton } from "../../../../models/Table";
import { findRoleLabel, PartialUser, User } from "../../../../models/User";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { FormControl } from "@angular/forms";
import { toSignal } from "@angular/core/rxjs-interop";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import * as UserActions from "../../../users/store/actions/users.actions";
import { createSortArray } from "../../../../../utils/utils";
import { ShowImageComponent } from "../../../../components/show-image/show-image.component";
import { getRoleNames } from "../../store/selectors/roleNames.selectors";

@Component({
  selector: 'app-list-user',
  standalone: true,
  imports: [CommonModule, MatIconModule, SearchComponent, TableComponent, TableSkeletonComponent, MatDialogModule, ShowImageComponent],
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
      <app-show-image classes="w-16 h-16" [imageUrl]="row.avatarUrl || ''" [objectName]="row.email" />
    </ng-template>

    <ng-template #rolesRow let-row>
      <div class="flex flex-wrap gap-1" *ngIf="(roleNames$ | async) as roleNames">
        <div class="gap-1" *ngFor="let role of row.roles">
          <span class="whitespace-nowrap bg-gray-100 text-sm me-2 px-2.5 py-0.5 rounded">{{ findRoleLabel(roleNames, role.roleName) }}</span>
        </div>
      </div>
    </ng-template>

    <ng-template #contactRow let-row>
      <div class="flex">
          <span *ngIf="!!row.email" class="inline-flex items-center px-2.5 py-0.5 rounded-md shadow-sm accent text-sm font-medium" href="row.email">
            <mat-icon class="icon-size material-symbols-rounded">mail</mat-icon>&nbsp;{{ row.email }}
          </span>
      </div>

    </ng-template>

    <ng-template #skeleton>
      <app-table-skeleton [columns]="columns" />
    </ng-template>
  `,
  styles: [
  ]
})
export default class UsersComponent {
  @ViewChild("imageRow") imageRow: TemplateRef<any> | undefined;
  @ViewChild("contactRow") contactRow: TemplateRef<any> | undefined;
  @ViewChild("rolesRow") rolesRow: TemplateRef<any> | undefined;

  store: Store<AppState> = inject(Store);
  roleNames$ = this.store.select(getRoleNames);
  userPaginate$ = this.store.select(getUsersPaginate);
  dialog = inject(MatDialog);

  columns: any[] = [];
  displayedColumns: string[] = [];

  buttons: TableButton<PartialUser>[] = [
    { iconName: "delete", bgColor: "red", callback: elem => this.openDialog(elem) },
    { iconName: "edit", bgColor: "orange", callback: elem => this.store.dispatch(RouterActions.go({ path: [`users/${elem.id}`] })) },
    { iconName: "visibility", bgColor: "sky", callback: elem => this.store.dispatch(RouterActions.go({ path: [`users/${elem.id}/view`] })) }
  ];

  paginator: WritableSignal<Table> = signal({
    pageIndex: 0,
    pageSize: 10
  });

  sorter: WritableSignal<Sort[]> = signal([{ active: "createdAt", direction: "desc" }]);

  search = new FormControl("");
  searchText = toSignal(this.search.valueChanges.pipe(
    debounceTime(250),
    distinctUntilChanged(),
  ));

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
          columnDef: 'username',
          header: 'Username',
          cell: (row: User) => `${row.username}`,
          width: "10rem",
          sortable: true
        },
        {
          columnDef: 'role',
          header: 'Ruoli',
          template: this.rolesRow,
          width: "12rem",
          sortable: false
        },
        {
          columnDef: 'email',
          header: 'Email',
          template: this.contactRow,
          width: "10rem",
          sortable: true
        }
      ];
      this.displayedColumns = [...this.columns.map(c => c.columnDef), "actions"];
    })
  }

  openDialog(user: PartialUser) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData> {
        title: "Conferma rimozione",
        content: `
        Si sta eliminando il cliente ${user.email}.
        <br>
        Questa operazione non è reversibile.
        `,
        buttons: [
          { iconName: "delete", label: "Elimina", bgColor: "remove", onClick: () => dialogRef.close(true) },
          { iconName: "clear", label: "Annulla",  onClick: () => dialogRef.close(false) }
        ]
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if(!result) {
        return;
      }
      this.deleteUser(user);
    });
  }

  constructor() {
    // Questo effect viene triggerato ogni qual volta un dei signal presenti all'interno cambia di valore
    effect(() => {
      this.store.dispatch(
        UserActions.loadUsers({
          query: {
            query: {
              value: this.searchText() ?? ""
            },
            options: {
              limit: this.paginator().pageSize,
              page: (this.paginator().pageIndex + 1),
              sort: createSortArray(this.sorter()),
              populate: "roles"
            }
          }
        })
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

  protected readonly findRoleLabel = findRoleLabel;
}
