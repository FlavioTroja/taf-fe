import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, concatMap, defer, exhaustMap, map, of } from "rxjs";
import { AppState } from "../../../../app.config";
import { getProfileMunicipalityId } from "../../../../core/profile/store/profile.selectors";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { Event } from "../../../../models/Event";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";
import { ActivitiesService } from "../../../activities/services/activities.service";
import { EventsService } from "../../services/events.service";
import * as EventsActions from "../actions/events.actions";
import { getActiveEventChanges } from "../selectors/events.selectors";

@Injectable({
  providedIn: "root",
})
export class EventsEffects {

  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private eventsService: EventsService,
    private activityService: ActivitiesService
  ) {
  }

  addEventEffect$ = createEffect(() => this.actions$.pipe(
    ofType(EventsActions.addEvent),
    exhaustMap(({ event }) => this.eventsService.addEvent(event)
      .pipe(
        concatMap((event) => [
          EventsActions.addEventSuccess({ event }),
          RouterActions.go({ path: [ '/events' ] })
        ]),
        catchError((error) => of(EventsActions.addEventFailed({ error })))
      ))
  ))

  editEventEffect$ = createEffect(() => this.actions$.pipe(
    ofType(EventsActions.editEvent),
    concatLatestFrom(() => [
      this.store.select(getActiveEventChanges),
      this.store.select(selectCustomRouteParam("id"))
    ]),
    exhaustMap(([ _, changes, id ]) => {
      if (id === 'new') {
        return of(EventsActions.addEvent({
          event: {
            ...changes,
          }
        }));
      }
      return this.eventsService.editEvent(id, changes as Event)
        .pipe(
          concatMap((event) => [
            EventsActions.editEventSuccess({ event }),
            RouterActions.go({ path: [ "/events" ] })
          ]),
          catchError((err) => of(EventsActions.editEventFailed(err)))
        )
    })
  ))

  deleteEventEffect$ = createEffect(() => this.actions$.pipe(
    ofType(EventsActions.deleteEvent),
    concatLatestFrom(() => [
      this.store.select(getProfileMunicipalityId),
    ]),
    exhaustMap(([ { id }, municipalityId ]) => this.eventsService.deleteEvent(id)
      .pipe(
        map(() => EventsActions.loadPaginateEvents({ query: { page: 0, limit: 10, filters: { municipalityId } } })),
        catchError((err) => of(EventsActions.deleteEventFailed(err)))
      ))
  ))

  loadEventsEffect$ = createEffect(() => this.actions$.pipe(
    ofType(EventsActions.loadPaginateEvents),
    exhaustMap(({ query }) => this.eventsService.loadEvents(query)
      .pipe(
        concatMap((events) => [
          EventsActions.loadPaginateEventsSuccess({ events }),
          EventsActions.clearEventActive()
        ]),
        catchError((error) => of(EventsActions.loadPaginateEventsFailed({ error })))
      ))
  ))

  getNewsEffect$ = createEffect(() => this.actions$.pipe(
    ofType(EventsActions.getEvent),
    exhaustMap(({ id }) => this.eventsService.getActiveEvent(id)
      .pipe(
        concatMap((current) =>
          defer(() =>
            current.activityId
              ? this.activityService.getActiveActivity(current.activityId)
              : of(undefined))
            .pipe(
              map((activity) => EventsActions.getEventSuccess({ current, activity })),
              catchError(error => of(EventsActions.getEventFailed))
            )
        ),
        catchError((error) => of(EventsActions.getEventFailed({ error })))
      ))
  ))

  manageNotificationNewsErrorEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      EventsActions.loadPaginateEventsFailed,
      EventsActions.getEventFailed,
      EventsActions.addEventFailed,
      EventsActions.editEventFailed
    ]),
    exhaustMap((err) => [
      UIActions.setUiNotification({
        notification: {
          type: NOTIFICATION_LISTENER_TYPE.ERROR,
          message: err.error.reason?.message || ""
        }
      })
    ])
  ))
}
