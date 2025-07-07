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
import { SortSearch } from "../../../../../global";
import { createSortArray } from "../../../../../utils/utils";
import { AppState } from "../../../../app.config";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import { SearchComponent } from "../../../../components/search/search.component";
import { TableSkeletonComponent } from "../../../../components/skeleton/table-skeleton.component";
import { TableComponent } from "../../../../components/table/table.component";
import { getProfileMunicipalityId, getProfileUser } from "../../../../core/profile/store/profile.selectors";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { selectCustomRouteParam, selectRouteUrl } from "../../../../core/router/store/router.selectors";
import { PartialNotification } from "../../../../models/Notifications";
import { Sort, Table, TableButton } from "../../../../models/Table";
import { Roles } from "../../../../models/User";
import * as NotificationActions from "../../store/actions/notification.actions";
import { toggleReadNotification } from "../../store/actions/notification.actions";
import { getNotificationsPaginate } from "../../store/selectors/notification.selectors";

@Component({
  selector: 'app-edits',
  standalone: true,
  imports: [ CommonModule, MatIconModule, TableComponent, TableSkeletonComponent, MatDialogModule, SearchComponent ],
  template: `
    <div class="grid gap-3">
      <div class="flex justify-between gap-2 w-full">
        <div class="w-1/2 accent p-2 cursor-pointer rounded border-accent font-bold text-center"
             [ngClass]="{ 'accent border-accent font-bold': isSentNotificationRoute}"
             (click)="toggleNotificationRoute(true)">Notifiche Inviate
        </div>
        <div class="w-1/2 p-2 cursor-pointer rounded text-center"
             [ngClass]="{ 'accent border-accent font-bold': isReceivedNotificationRoute}"
             (click)="toggleNotificationRoute(false)">Notifiche Ricevute
        </div>
      </div>
      <app-search [search]="search"/>
      <div *ngIf="notificationsPaginate$ | async as notificationsPaginate else skeleton">
        <app-table
          [dataSource]="notificationsPaginate"
          [columns]="columns"
          [displayedColumns]="displayedColumns"
          [paginator]="paginator"
          [buttons]="getButtons"
          (onPageChange)="changePage($event)"
          (onPageSizeChange)="changePageSize($event)"
          (onSortChange)="changeSort($event)"/>
      </div>
    </div>


    <ng-template #messageRow let-row>
      <div>{{ row.message }}</div>
    </ng-template>

    <ng-template #timeStampRow let-row>
      <div>{{ row.timestamp ? (row.timestamp | date: 'dd/MM/yyyy HH:mm') : '' }}</div>
    </ng-template>

    <ng-template #skeleton>
      <app-table-skeleton [columns]="columns"/>
    </ng-template>
  `,
  styles: [ `` ]
})
export default class SentNotificationsComponent implements AfterViewInit {
  @ViewChild("messageRow") messageRow: TemplateRef<any> | undefined;
  @ViewChild("timeStampRow") timeStampRow: TemplateRef<any> | undefined;

  store: Store<AppState> = inject(Store);
  notificationsPaginate$ = this.store.select(getNotificationsPaginate);
  dialog = inject(MatDialog);

  columns: any[] = [];
  displayedColumns: string[] = [];

  id = toSignal(this.store.select(selectCustomRouteParam('id')));
  routeUrl = toSignal(this.store.select(selectRouteUrl));
  currentUser = toSignal(this.store.select(getProfileUser))

  get isSentNotificationRoute() {
    return this.routeUrl() === '/notifications/sent'
  }

  get isReceivedNotificationRoute() {
    return this.routeUrl() === '/notifications/received'
  }

  get getButtons() {
    if (this.isSentNotificationRoute) {
      return this.sentRouteButtons
    } else {
      return this.receivedRouteButtons;
    }
  }

  toggleNotificationRoute(bool: boolean) {
    if (bool) {
      this.store.dispatch(RouterActions.go({ path: [ `notifications/sent` ] }))
    } else {
      this.store.dispatch(RouterActions.go({ path: [ `notifications/received` ] }))
    }
  }

  sentRouteButtons: TableButton<PartialNotification>[] = [
    { iconName: "delete", bgColor: "red", callback: elem => this.openDialog(elem) },
    {
      iconName: "edit",
      bgColor: "orange",
      callback: elem => this.store.dispatch(RouterActions.go({ path: [ `notifications/sent/${ elem.id }` ] }))
    },
    {
      iconName: "visibility",
      bgColor: "sky",
      callback: elem => this.store.dispatch(RouterActions.go({ path: [ `notifications/sent/${ elem.id }/view` ] }))
    }
  ];

  receivedRouteButtons: TableButton<PartialNotification>[] = [
    {
      iconName: "done_all",
      bgColor: "sky",
      callback: ({ id }) => this.store.dispatch(toggleReadNotification({ id: id ?? '' }))
    },
    {
      iconName: "visibility",
      bgColor: "sky",
      callback: elem => this.store.dispatch(RouterActions.go({ path: [ `notifications/received//${ elem.id }/view` ] }))
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

  municipalityId = this.store.selectSignal(getProfileMunicipalityId);

  ngAfterViewInit() {

    Promise.resolve(null).then(() => {
      this.columns = [
        {
          columnDef: 'message',
          header: 'Messaggio',
          width: "40rem",
          template: this.messageRow,
        },
        {
          columnDef: 'timestamp',
          header: 'Data',
          width: "15rem",
          template: this.timeStampRow,
        },
      ];
      this.displayedColumns = [ ...this.columns.map(c => c.columnDef), "actions" ];
    })
  }

  openDialog(notification: PartialNotification) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData>{
        title: "Conferma rimozione",
        content: `
        Si sta eliminando la notifica.
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
      this.deleteNotification(notification);
    });
  }

  constructor() {
    effect(() => {
      const municipalityId = this.municipalityId();
      const userId = this.currentUser()?.id;

      if (!municipalityId || !userId) {
        return;
      }

      const sentRouteQuery = {
        page: this.paginator().pageIndex,
        limit: this.paginator().pageSize,
        search: this.searchText()!,
        filters: { municipalityId, senderId: userId },
        sort: createSortArray(this.sorter()) as SortSearch<string, string>
      }

      const receivedRouteQuery = {
        page: this.paginator().pageIndex,
        limit: this.paginator().pageSize,
        search: this.searchText()!,
        filters: { municipalityId, recipientId: userId },
        sort: createSortArray(this.sorter()) as SortSearch<string, string>
      }

      this.store.dispatch(
        NotificationActions.loadPaginateNotifications({
          query: this.isSentNotificationRoute ? sentRouteQuery : receivedRouteQuery,
        })
      );
    }, { allowSignalWrites: true })

  }

  private deleteNotification(row: PartialNotification) {
    this.store.dispatch(NotificationActions.deleteNotification({ id: row.id! }));
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
