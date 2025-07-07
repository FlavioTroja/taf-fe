import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, concatMap, exhaustMap, map, of } from "rxjs";
import { AppState } from "../../../../app.config";
import { getProfileMunicipalityId } from "../../../../core/profile/store/profile.selectors";
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
      if ( id === 'new' ) {
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
    concatLatestFrom(() => [
      this.store.select(getProfileMunicipalityId),
    ]),
    exhaustMap(([ { id }, municipalityId ]) => this.municipalsService.deleteMunicipal(id)
      .pipe(
        map(() => MunicipalsActions.loadMunicipalsPaginate({
          query: {
            page: 0,
            limit: 10,
            filters: { municipalityId }
          }
        })),
        catchError((err) => of(MunicipalsActions.deleteMunicipalFailed(err)))
      ))
  ))

  loadMunicipalsPaginateEffect$ = createEffect(() => this.actions$.pipe(
    ofType(MunicipalsActions.loadMunicipalsPaginate),
    exhaustMap(({ query }) => this.municipalsService.loadPaginateMunicipals(query)
      .pipe(
        concatMap((municipals) => [
          MunicipalsActions.loadMunicipalsPaginateSuccess({ municipals }),
          MunicipalsActions.clearMunicipalActive()
        ]),
        catchError((error) => of(MunicipalsActions.loadMunicipalsPaginateFailed({ error })))
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
      MunicipalsActions.loadMunicipalsPaginateFailed,
      MunicipalsActions.getMunicipalFailed,
      MunicipalsActions.addMunicipalFailed,
      MunicipalsActions.editMunicipalFailed
    ]),
    exhaustMap((err) => [
      UIActions.setUiNotification({
        notification: {
          type: NOTIFICATION_LISTENER_TYPE.ERROR,
          message: err.error.error || ""
        }
      })
    ])
  ))
}
