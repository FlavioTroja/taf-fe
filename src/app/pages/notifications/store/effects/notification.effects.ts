import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, concatMap, defer, exhaustMap, map, mergeMap, of } from "rxjs";
import { AppState } from "../../../../app.config";
import { getProfileMunicipalityId } from "../../../../core/profile/store/profile.selectors";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { getRouterUrl, selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";
import { Notification } from "../../../../models/Notifications";
import { UsersService } from "../../../users/services/users.service";
import { NotificationsService } from "../../services/notifications.service";
import * as NotificationActions from "../actions/notification.actions";
import { getActiveNotificationChanges } from "../selectors/notification.selectors";

@Injectable({
  providedIn: "root",
})
export class NotificationEffects {

  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private notificationsService: NotificationsService,
    private userService: UsersService
  ) {
  }

  addNotificationEffect$ = createEffect(() => this.actions$.pipe(
    ofType(NotificationActions.addNotification),
    exhaustMap(({ notification }) => this.notificationsService.addNotification(notification)
      .pipe(
        concatMap((notification) => [
          NotificationActions.addNotificationSuccess({ notification }),
          RouterActions.go({ path: [ '/notifications/sent' ] })
        ]),
        catchError((error) => of(NotificationActions.addNotificationFailed({ error })))
      ))
  ))

  editNotificationEffect$ = createEffect(() => this.actions$.pipe(
    ofType(NotificationActions.editNotification),
    concatLatestFrom(() => [
      this.store.select(getActiveNotificationChanges),
      this.store.select(selectCustomRouteParam("id")),
      this.store.select(getRouterUrl)
    ]),
    exhaustMap(([ _, changes, id, routeUrl ]) => {
      if ( routeUrl === '/notifications/new' ) {
        return of(NotificationActions.addNotification({
          notification: {
            ...changes,
          }
        }));
      }
      return this.notificationsService.editNotification(id, changes as Notification)
        .pipe(
          concatMap((notification) => [
            NotificationActions.editNotificationSuccess({ notification }),
            RouterActions.go({ path: [ "/notifications/sent" ] })
          ]),
          catchError((err) => of(NotificationActions.editNotificationFailed(err)))
        )
    })
  ))

  deleteNotificationEffect$ = createEffect(() => this.actions$.pipe(
    ofType(NotificationActions.deleteNotification),
    concatLatestFrom(() => [
      this.store.select(getProfileMunicipalityId),
    ]),
    exhaustMap(([ { id }, municipalityId ]) => this.notificationsService.deleteNotification(id)
      .pipe(
        map(() => NotificationActions.loadPaginateNotifications({
          query: {
            page: 0,
            limit: 10,
            filters: { municipalityId }
          }
        })),
        catchError((err) => of(NotificationActions.deleteNotificationFailed(err)))
      ))
  ))

  loadNotificationsEffect$ = createEffect(() => this.actions$.pipe(
    ofType(NotificationActions.loadPaginateNotifications),
    exhaustMap(({ query }) => this.notificationsService.loadNotifications(query)
      .pipe(
        concatMap((notifications) => [
          NotificationActions.loadPaginateNotificationsSuccess({ notifications }),
          NotificationActions.clearNotificationActive()
        ]),
        catchError((error) => of(NotificationActions.loadPaginateNotificationsFailed({ error })))
      ))
  ))

  getNotificationEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationActions.getNotification),
      exhaustMap(({ id }) =>
        this.notificationsService.getActiveNotification(id).pipe(
          mergeMap(current =>
            defer(() =>
              current.recipientId
                ? this.userService.getUser(current.recipientId!)
                : of(undefined))
              .pipe(
                map(recipient =>
                  NotificationActions.getNotificationSuccess({ current, recipient })
                ),
                catchError(error =>
                  of(NotificationActions.getNotificationFailed({ error }))
                )
              )
          ),
          catchError(error =>
            of(NotificationActions.getNotificationFailed({ error }))
          )
        )
      )
    )
  );

  manageNotificationNewsErrorEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      NotificationActions.loadPaginateNotificationsFailed,
      NotificationActions.getNotificationFailed,
      NotificationActions.addNotificationFailed,
      NotificationActions.editNotificationFailed
    ]),
    exhaustMap((err) => [
      UIActions.setUiNotification({
        notification: {
          type: NOTIFICATION_LISTENER_TYPE.ERROR,
          message: err.error.error.error.error || ""
        }
      })
    ])
  ))
}
