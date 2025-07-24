import { CommonModule } from "@angular/common";
import { Component, effect, inject, OnDestroy, OnInit, Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatNativeDateModule, MatOptionModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { Store } from "@ngrx/store";
import { filter, map, pairwise, startWith, Subject, takeUntil } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { difference } from "../../../../../utils/utils";
import { AppState } from "../../../../app.config";
import { InputComponent } from "../../../../components/input/input.component";
import { getProfileMunicipalityId, getProfileUser } from "../../../../core/profile/store/profile.selectors";
import { getRouterData, selectCustomRouteParam, selectRouteUrl } from "../../../../core/router/store/router.selectors";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";
import { createNotificationPayload, Notification, PartialNotification } from "../../../../models/Notifications";
import { PartialUser } from "../../../../models/User";
import { UsersService } from "../../../users/services/users.service";
import { loadPaginateUsers } from "../../../users/store/actions/users.actions";
import { getUsersPaginate } from "../../../users/store/selectors/users.selectors";
import * as NotificationActions from "../../store/actions/notification.actions";
import { getActiveNotification } from "../../store/selectors/notification.selectors";

@Component({
  selector: 'app-edit-sent-notification',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, InputComponent, MatIconModule, MatDatepickerModule, MatFormFieldModule, MatDialogModule, MatNativeDateModule, MatOptionModule, MatSelectModule, MatAutocompleteModule ],
  template: `
    <form [formGroup]="notificationsForm" autocomplete="off">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <app-input type="text" id="message" label="Messaggio" [formControl]="f.message"/>
          <app-input type="text" id="sender" label="Mittente" [formControl]="f.senderName"/>
          <div class="flex flex-col w-full lg:w-1/2 px-1">
            <label class="text-md justify-left block px-3 py-0 font-medium">Destinatario</label>
            <input
              [ngStyle]="viewOnly() ? {'cursor': 'pointer'} : {}"
              type="text"
              class="focus:outline-none p-3 rounded-md w-full border-input"
              placeholder="Scegli i destinatario"
              matInput
              formControlName="recipient"
              [matAutocomplete]="autotwo"
              [readonly]="viewOnly()"
            >

            <mat-autocomplete #autotwo="matAutocomplete" [displayWith]="displayUser"
                              (optionSelected)="onRecipientSelect($event)">
              <div *ngIf="(users$ | async) as users">
                <mat-option *ngFor="let user of users.content" [value]="user">
                  {{ user.name + ' ' + user.surname }}
                </mat-option>
                <mat-option *ngIf="!users.content?.length">Nessun risultato</mat-option>
              </div>
            </mat-autocomplete>
          </div>
        </div>
      </div>
    </form>
  `,
  styles: [ `
    .tag:hover .close-icon {
      display: block !important;
    }
  ` ]
})
export default class EditSentNotificationComponent implements OnInit, OnDestroy {
  fb = inject(FormBuilder);
  store: Store<AppState> = inject(Store);
  userService = inject(UsersService);

  get f() {
    return this.notificationsForm.controls;
  }

  subject = new Subject();

  active$ = this.store.select(getActiveNotification);
  users$ = this.store.select(getUsersPaginate)

  users = toSignal(this.users$)

  id = toSignal(this.store.select(selectCustomRouteParam('id')));
  viewOnly: Signal<boolean> = toSignal(this.store.select(getRouterData).pipe(
    map(data => data!["viewOnly"] ?? false)
  ));
  municipalityId = this.store.selectSignal(getProfileMunicipalityId);
  routeUrl = toSignal(this.store.select(selectRouteUrl));
  currentUser = toSignal(this.store.select(getProfileUser))

  initFormValue: PartialNotification = {}
  notificationsForm = this.fb.group({
    message: this.fb.control({ value: '', disabled: this.viewOnly() }, Validators.required),
    senderName: this.fb.control({
      value: '',
      disabled: this.viewOnly() || !!this.currentUser()
    }),
    recipient: this.fb.control<PartialUser | null>({
      value: null,
      disabled: this.viewOnly()
    }, Validators.required),
  });

  searchingInRecipientInput = false;

  get isNewNotification() {
    return this.routeUrl() === '/notifications/new'
  }

  displayUser(user: PartialUser): string {
    return user ? (user?.name + ' ' + user?.surname) : '';
  }

  onRecipientSelect(event: any) {
    const recipient = event.option.value as Notification | any;
    this.notificationsForm.patchValue({ recipient })
  }

  editNotificationChanges() {
    this.notificationsForm.valueChanges.pipe(
      startWith(this.initFormValue),
      pairwise(),
      map(([ _, newState ]: any) => {
        if (!Object.values(this.initFormValue).length && !this.isNewNotification) {
          return {};
        }

        const diff = {
          ...difference(this.initFormValue, newState),
          senderId: this.currentUser()?.id,
          recipientId: newState.recipient?.id,
          municipalityId: this.municipalityId(),
        };

        // console.log({ newState, diff, payload: createNotificationPayload(diff) })

        return createNotificationPayload(diff);
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.notificationsForm.invalid ? {
        ...changes,
      } : {}),
      takeUntil(this.subject),
      // tap(changes => console.log(changes)),
    ).subscribe((changes) => {
      this.store.dispatch(NotificationActions.notificationActiveChanges({ changes }));
    });
  }

  constructor() {

    effect(() => {

      const municipalityId = this.municipalityId();

      if (!municipalityId) {
        return
      }

      this.store.dispatch(loadPaginateUsers({
        query: {
          page: 0,
          limit: 10,
          filters: {
            municipalityId: this.municipalityId(),
          }
        }
      }))


    }, { allowSignalWrites: true });

    this.users$.pipe().subscribe((users) => {
      if (users?.content?.length === 0 && !this.searchingInRecipientInput) {
        this.store.dispatch(UIActions.setUiNotification({
          notification: {
            type: NOTIFICATION_LISTENER_TYPE.WARNING,
            message: "Non sono presenti utenti destinatari"
          }
        }))
      }
    })


    effect(() => {

      const currentUser = this.currentUser()

      if (!currentUser) {
        return
      }

      this.initFormValue = {
        ...this.initFormValue,
        senderName: this.currentUser()?.name + ' ' + this.currentUser()?.surname,
      } as PartialNotification

      this.notificationsForm.patchValue({ senderName: this.currentUser()?.name + ' ' + this.currentUser()?.surname })

    }, { allowSignalWrites: true });


    this.f.recipient.valueChanges
      .pipe(
        debounceTime(300),
      )
      .subscribe((value) => {

        this.searchingInRecipientInput = true;

        if (typeof value === 'string') {
          this.store.dispatch(loadPaginateUsers({
            query: {
              page: 0,
              limit: 10,
              search: value as string,
              filters: {
                municipalityId: this.municipalityId(),
              }
            }
          }))

        }
      })

  }


  ngOnInit() {

    if (!this.isNewNotification) {
      this.store.dispatch(NotificationActions.getNotification({ id: this.id() }));
    }

    this.active$.pipe(
      filter((value) => !this.isNewNotification && !!value),
    ).subscribe((value) => {

      this.initFormValue = {
        ...value,
        recipient: value?.recipient ?? undefined
      } as PartialNotification;

      this.notificationsForm.patchValue({
        ...value,
        recipient: value?.recipient ?? undefined
      }, { emitEvent: false });
    })

    this.editNotificationChanges();
  }

  ngOnDestroy() {
    this.notificationsForm.reset();
    this.store.dispatch(NotificationActions.clearNotificationActive());
  }
}
