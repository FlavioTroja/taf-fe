import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { SuppliersService } from "../../services/suppliers.service";
import { catchError, concatMap, exhaustMap, map, of } from "rxjs";
import * as SuppliersActions from "../actions/suppliers.actions";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { Store } from "@ngrx/store";
import { Supplier } from "../../../../models/Supplier";
import { getActiveSupplierChanges } from "../selectors/suppliers.selectors";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";


@Injectable({
  providedIn: 'root'
})
export class SuppliersEffects  {

  addSupplierEffect$ = createEffect(() => this.actions$.pipe(
    ofType(SuppliersActions.addSupplier),
    exhaustMap(({ supplier }) => this.supplierService.addSupplier(supplier)
      .pipe(
        concatMap((supplier) => [
          SuppliersActions.addSupplierSuccess({ supplier }),
          RouterActions.go({ path: [`/suppliers`] })
        ]),
        catchError((err) => of(SuppliersActions.addSupplierFailed(err)))
      ))
  ));

  getSupplierEffect$ = createEffect(() => this.actions$.pipe(
    ofType(SuppliersActions.getSupplier),
    exhaustMap(({ id, params }) => this.supplierService.getSupplier(id, params)
      .pipe(
        map((supplier) => SuppliersActions.getSupplierSuccess({ current: supplier })),
        catchError((err) => of(SuppliersActions.getSupplierFailed(err)))
      ))
  ));

  getSupplierFailedEffect$ = createEffect(() => this.actions$.pipe(
    ofType(SuppliersActions.getSupplierFailed),
    exhaustMap(() => [
      RouterActions.go({ path: ["/suppliers"] })
    ])
  ));

  deleteSupplierEffect$ = createEffect(() => this.actions$.pipe(
    ofType(SuppliersActions.deleteSupplier),
    exhaustMap(({ id  }) => this.supplierService.deleteSupplier(id)
      .pipe(
        map((supplier) => SuppliersActions.loadSuppliers({ query: { query: {}, options: { limit: 10, page: 1, populate: "address" } } })),
        catchError((err) => of(SuppliersActions.deleteSupplierFailed(err)))
      ))
  ));

  loadSupplierEffect$ = createEffect(() => this.actions$.pipe(
    ofType(SuppliersActions.loadSuppliers),
    exhaustMap(({ query }) => this.supplierService.loadSuppliers(query)
      .pipe(
        concatMap((suppliers) => [
          SuppliersActions.loadSuppliersSuccess({ suppliers }),
          SuppliersActions.clearSupplierActive()
        ]),
        catchError((err) => {
          return of(SuppliersActions.loadSuppliersFailed(err));
        })
      ))
  ));

  editSupplierEffect$ = createEffect(() => this.actions$.pipe(
    ofType(SuppliersActions.editSupplier),
    concatLatestFrom(() => [
      this.store.select(getActiveSupplierChanges)
    ]),
    exhaustMap(([_, changes]) => {
      if(isNaN(changes.id!)) {
        return of(SuppliersActions.addSupplier({ supplier: changes as Supplier }));
      }
      return this.supplierService.editSupplier(changes?.id!, changes as Supplier)
        .pipe(
          concatMap((supplier) => [
            SuppliersActions.editSupplierSuccess({ supplier }),
            RouterActions.go({ path: ["/suppliers"] })
          ]),
          catchError((err) => of(SuppliersActions.editSupplierFailed(err)))
        )
    })
  ));

  manageNotificationSuppliersErrorEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      SuppliersActions.getSupplierFailed,
      SuppliersActions.addSupplierFailed,
      SuppliersActions.loadSuppliersFailed,
      SuppliersActions.deleteSupplierFailed,
      SuppliersActions.editSupplierFailed
    ]),
    exhaustMap((err) => [
      UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.ERROR, message: err.error.reason?.message || "" } })
    ])
  ));

  constructor(private actions$: Actions,
              private supplierService: SuppliersService,
              private store: Store) {}
}
