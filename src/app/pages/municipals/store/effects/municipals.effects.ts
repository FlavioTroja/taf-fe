import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, concatMap, exhaustMap, map, of } from "rxjs";
import { AppState } from "../../../../app.config";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { Municipal } from "../../../../models/Municipals";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";
import { MunicipalsService } from "../../services/municipals.service";
import * as MunicipalsActions from "../actions/municipals.actions";
import { getActiveMunicipalChanges } from "../selectors/municipals.selectors";

@Injectable({
  providedIn: "root",
})
export class MunicipalsEffects {

  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private municipalsService: MunicipalsService,
  ) {
  }

  addMunicipalEffect$ = createEffect(() => this.actions$.pipe(
    ofType(MunicipalsActions.addMunicipal),
    exhaustMap(({ municipal }) => this.municipalsService.addMunicipal(municipal)
      .pipe(
        concatMap((municipal) => [
          MunicipalsActions.addMunicipalSuccess({ municipal }),
          RouterActions.go({ path: [ '/municipals' ] })
        ]),
        catchError((error) => of(MunicipalsActions.addMunicipalFailed({ error })))
      ))
  ))

  editMunicipalEffect$ = createEffect(() => this.actions$.pipe(
    ofType(MunicipalsActions.editMunicipal),
    concatLatestFrom(() => [
      this.store.select(getActiveMunicipalChanges),
      this.store.select(selectCustomRouteParam("id"))
    ]),
    exhaustMap(([ _, changes, id ]) => {
      if (id === 'new') {
        return of(MunicipalsActions.addMunicipal({
          municipal: {
            ...changes,
          }
        }));
      }
      return this.municipalsService.editMunicipal(id, changes as Municipal)
        .pipe(
          concatMap((municipal) => [
            MunicipalsActions.editMunicipalSuccess({ municipal }),
            RouterActions.go({ path: [ "/municipals" ] })
          ]),
          catchError((err) => of(MunicipalsActions.editMunicipalFailed(err)))
        )
    })
  ))

  deleteMunicipalEffect$ = createEffect(() => this.actions$.pipe(
    ofType(MunicipalsActions.deleteMunicipal),
    exhaustMap(({ id }) => this.municipalsService.deleteMunicipal(id)
      .pipe(
        map(() => MunicipalsActions.loadMunicipals()),
        catchError((err) => of(MunicipalsActions.deleteMunicipalFailed(err)))
      ))
  ))

  loadMunicipalsEffect$ = createEffect(() => this.actions$.pipe(
    ofType(MunicipalsActions.loadMunicipals),
    exhaustMap(() => this.municipalsService.loadMunicipals()
      .pipe(
        concatMap((municipals) => [
          MunicipalsActions.loadMunicipalsSuccess({ municipals })
        ]),
        catchError((error) => of(MunicipalsActions.loadMunicipalsFailed({ error })))
      ))
  ))

  getMunicipalEffect$ = createEffect(() => this.actions$.pipe(
    ofType(MunicipalsActions.getMunicipal),
    exhaustMap(({ id }) => this.municipalsService.getActiveMunicipal(id)
      .pipe(
        concatMap((current) => [
          MunicipalsActions.getMunicipalSuccess({ current })
        ]),
        catchError((error) => of(MunicipalsActions.getMunicipalFailed({ error })))
      ))
  ))

  manageNotificationMunicipalErrorEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      MunicipalsActions.loadMunicipalsFailed,
      MunicipalsActions.getMunicipalFailed,
      MunicipalsActions.addMunicipalFailed,
      MunicipalsActions.editMunicipalFailed
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
