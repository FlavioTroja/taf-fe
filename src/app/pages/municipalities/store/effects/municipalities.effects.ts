import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, concatMap, exhaustMap, of } from "rxjs";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";
import { MunicipalitiesService } from "../../services/municipalities.service";
import * as MuncipalitiesActions from "../actions/municipalities.actions";

@Injectable({
  providedIn: "root",
})
export class MunicipalitiesEffects {

  constructor(
    private actions$: Actions,
    private store: Store,
    private municipalitiesService: MunicipalitiesService,
  ) {
  }

  loadMunicipalitiesEffect$ = createEffect(() => this.actions$.pipe(
    ofType(MuncipalitiesActions.loadMunicipalities),
    exhaustMap(() => this.municipalitiesService.loadMunicipalities()
      .pipe(
        concatMap((municipalities) => [
          MuncipalitiesActions.loadMunicipalitiesSuccess({ municipalities })
        ]),
        catchError((error) => of(MuncipalitiesActions.loadMunicipalitiesFailed({ error })))
      ))
  ))


  manageNotificationMunicipalityErrorEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      MuncipalitiesActions.loadMunicipalitiesFailed
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
