import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import * as DraftsActions from "../actions/drafts.actions";
import { catchError, concatMap, exhaustMap, map, of} from "rxjs";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";
import { Store } from "@ngrx/store";
import { getSetupFilter } from "../selectors/drafts.selectors";
import { SetupsService} from "../../../inspections/services/setups.service";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { getSetupChanges } from "../selectors/drafts.selectors";
import { SetupStatus } from "../../../../models/Setup";

@Injectable({
  providedIn: 'root'
})

export class DraftsEffects {

  loadAllSetupsEffect$ = createEffect(() => this.actions$.pipe(
    ofType(DraftsActions.loadSetups),
    concatLatestFrom(() => [
      this.store.select(getSetupFilter)
    ]),
    exhaustMap(([ _, query ]) => this.setupService.loadSetups(query!)
      .pipe(
        concatMap((setups) => [
          DraftsActions.loadSetupsSuccess({ setups }),
          DraftsActions.clearSetupActive(),
        ]),
        catchError((err) => {
          return of(DraftsActions.loadSetupsFailed(err));
        })
      ))
  ));

  editSetupDraftEffect$ = createEffect(() => this.actions$.pipe(
    ofType(DraftsActions.editSetupDraft),
    concatLatestFrom(() => [
      this.store.select(getSetupChanges)
    ]),
    exhaustMap(([_, changes]) => {
      return this.setupService.editSetupDraft(changes.id!, changes)
        .pipe(
          concatMap((setup) => [
            DraftsActions.editSetupDraftSuccess({ setup }),
            RouterActions.go({ path: [`drafts/${changes.id}/view`] })
          ]),
          catchError((err) => of(DraftsActions.editSetupDraftFailed(err)))
        );
    })
  ));

  editSetupFilterEffect$ = createEffect(() => this.actions$.pipe(
    ofType(DraftsActions.editSetupsFilter),
    concatMap(({ filters }) => [
      DraftsActions.editSetupsFilterSuccess({ filters }),
      DraftsActions.loadSetups({ query: filters })
    ])
  ));

  getSetupEffect$ = createEffect(() => this.actions$.pipe(
    ofType(DraftsActions.getSetup),
    exhaustMap(({ id }) => this.setupService.getSetup(id)
      .pipe(
        map((setUp) => DraftsActions.getSetupSuccess({ current: setUp })),
        catchError((err) => of(DraftsActions.getSetupFailed(err)))
      ))
  ));

  deleteSetupEffect$ = createEffect(() => this.actions$.pipe(
    ofType(DraftsActions.deleteSetup),
    exhaustMap(({ id }) => this.setupService.deleteCanceledSetup(id)
      .pipe(
        concatMap( setup => [
          DraftsActions.loadSetups({ query: { query: {}, options: { limit: 10, page: 1 } } }),
          DraftsActions.deleteSetupSuccess({ setup }),
          UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.SUCCESS, message: `Scheda tecnica n°${setup.quoteCode} eliminata con successo` } }),
          RouterActions.go({ path: [`drafts/`] }),
        ]),
        catchError((err) => of(DraftsActions.deleteSetupFailed(err)))
      ))
  ));

  quoteDraftEffect$ = createEffect(() => this.actions$.pipe(
    ofType(DraftsActions.quoteDraft),
    exhaustMap(({ id }) => this.setupService.quoteDraftById(id)
      .pipe(
        concatMap( setUp => [
          DraftsActions.quoteDraftSuccess({ newStatus: setUp.setupStatus }),
          RouterActions.go({ path: [`drafts/${setUp.id}/view`] }),
          UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.SUCCESS, message: `Preventivo n°${setUp.quoteCode} creato con successo` } })
        ]),
        catchError((err) => of(DraftsActions.quoteDraftFailed(err)))
      ))
  ));

  backToDraftEffect$ = createEffect(() => this.actions$.pipe(
    ofType(DraftsActions.backToDraft),
    exhaustMap(({ id }) => this.setupService.backToDraftById(id)
      .pipe(
        concatMap( setUp => [
          DraftsActions.backToDraftSuccess({ newStatus: setUp.setupStatus }),
          RouterActions.go({ path: [`drafts/${setUp.id}/view`] }),
        ]),
        catchError((err) => of(DraftsActions.backToDraftFailed(err)))
      ))
  ));

  confirmQuoteEffect$ = createEffect(() => this.actions$.pipe(
    ofType(DraftsActions.confirmQuote),
    exhaustMap(({ id }) => this.setupService.confirmQuoteById(id)
      .pipe(
        concatMap( setUp => [
          DraftsActions.confirmQuoteSuccess({ newStatus: setUp.setupStatus }),
          RouterActions.go({ path: [`drafts/${setUp.id}/view`] }),
          UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.SUCCESS, message: `Contratto n°${setUp.setupCode} creato con successo` } })
        ]),
        catchError((err) => of(DraftsActions.confirmQuoteFailed(err)))
      ))
  ));

  toggleDraftCanceled$ = createEffect(() => this.actions$.pipe(
    ofType(DraftsActions.toggleDraftCanceled),
    exhaustMap(({ id }) => this.setupService.toggleSetupStatusCanceled(id)
      .pipe(
        concatMap( setup => [
          // RouterActions.go({ path: [`drafts/${setup.id}/view`] }),
          DraftsActions.getSetup({ id: setup.id }),
          DraftsActions.toggleDraftCanceledSuccess({ newStatus: setup.setupStatus }),
          UIActions.setUiNotification({
            notification: {
              type: NOTIFICATION_LISTENER_TYPE.SUCCESS,
              message: setup.setupStatus === SetupStatus.CANCELED
                ? `Intervento cancellato con successo` : `Intervento ripristinato con successo`
            }
          }),
        ]),
        catchError((err) => of(DraftsActions.toggleDraftCanceledFailed(err)))
      ))
  ));

  manageNotificationSetupEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      DraftsActions.editSetupFailed,
      DraftsActions.loadSetupsFailed,
      DraftsActions.getSetupFailed,
      DraftsActions.deleteSetupFailed,
      DraftsActions.confirmQuoteFailed,
      DraftsActions.backToDraftFailed,
      DraftsActions.quoteDraftFailed,
      DraftsActions.editSetupDraftFailed,
    ]),
    exhaustMap((err) => [
      UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.ERROR, message: err.error.reason?.message || "" } })
    ])
  ));

  constructor(private actions$: Actions,
              private setupService: SetupsService,
              private store: Store) {}
}
