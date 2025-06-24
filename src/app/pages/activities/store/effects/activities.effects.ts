import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, concatMap, exhaustMap, map, of } from "rxjs";
import { AppState } from "../../../../app.config";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { Activity } from "../../../../models/Activities";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";
import { ActivitiesService } from "../../services/activities.service";
import * as ActivitiesActions from "../actions/activities.actions";
import { getActiveActivityChanges } from "../selectors/activities.selectors";

@Injectable({
  providedIn: "root",
})
export class ActivitiesEffects {

  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private activitiesService: ActivitiesService,
  ) {
  }

  addActivityEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ActivitiesActions.addActivity),
    exhaustMap(({ activity }) => this.activitiesService.addActivity(activity)
      .pipe(
        concatMap((activity) => [
          ActivitiesActions.addActivitySuccess({ activity }),
          RouterActions.go({ path: [ '/activities' ] })
        ]),
        catchError((error) => of(ActivitiesActions.addActivityFailed({ error })))
      ))
  ))

  editActivityEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ActivitiesActions.editActivity),
    concatLatestFrom(() => [
      this.store.select(getActiveActivityChanges),
      this.store.select(selectCustomRouteParam("id"))
    ]),
    exhaustMap(([ _, changes, id ]) => {
      if (id === 'new') {
        return of(ActivitiesActions.addActivity({
          activity: {
            ...changes,
          }
        }));
      }
      return this.activitiesService.editActivity(id, changes as Activity)
        .pipe(
          concatMap((activity) => [
            ActivitiesActions.editActivitySuccess({ activity }),
            RouterActions.go({ path: [ "/activities" ] })
          ]),
          catchError((err) => of(ActivitiesActions.editActivityFailed(err)))
        )
    })
  ))

  deleteActivityEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ActivitiesActions.deleteActivity),
    exhaustMap(({ id }) => this.activitiesService.deleteActivity(id)
      .pipe(
        map(() => ActivitiesActions.loadActivities({ query: { page: 0, limit: 10 } })),
        catchError((err) => of(ActivitiesActions.deleteActivityFailed(err)))
      ))
  ))

  loadActivitiesEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ActivitiesActions.loadActivities),
    exhaustMap(({ query }) => this.activitiesService.loadActivities(query)
      .pipe(
        concatMap((activities) => [
          ActivitiesActions.loadActivitiesSuccess({ activities })
        ]),
        catchError((error) => of(ActivitiesActions.loadActivitiesFailed({ error })))
      ))
  ))

  getActivityEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ActivitiesActions.getActivity),
    exhaustMap(({ id }) => this.activitiesService.getActiveActivity(id)
      .pipe(
        concatMap((current) => [
          ActivitiesActions.getActivitySuccess({ current })
        ]),
        catchError((error) => of(ActivitiesActions.getActivityFailed({ error })))
      ))
  ))

  manageNotificationActivityErrorEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      ActivitiesActions.loadActivitiesFailed,
      ActivitiesActions.getActivityFailed,
      ActivitiesActions.addActivityFailed,
      ActivitiesActions.editActivityFailed
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
