import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { WarehousesService } from "../../services/warehouses.service";
import { catchError, concatMap, exhaustMap, map, of } from "rxjs";
import * as WarehousesActions from "../actions/warehouses.actions";
import { Store } from "@ngrx/store";
import { getActiveWarehouseChanges } from "../selectors/warehouses.selectors";
import { PartialWarehouse } from "../../../../models/Warehouse";
import * as RouterActions from "../../../../core/router/store/router.actions";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";


@Injectable({
  providedIn: 'root'
})
export class WarehousesEffects  {

  addWarehouseEffect$ = createEffect(() => this.actions$.pipe(
    ofType(WarehousesActions.addWarehouse),
    exhaustMap(({ warehouse }) => this.warehouseService.addWarehouse(warehouse)
      .pipe(
        map((warehouse) => WarehousesActions.addWarehouseSuccess({ warehouse })),
        catchError((err) => of(WarehousesActions.addWarehouseFailed(err)))
      ))
  ));

  getWarehouseEffect$ = createEffect(() => this.actions$.pipe(
    ofType(WarehousesActions.getWarehouse),
    exhaustMap(({ id }) => this.warehouseService.getWarehouse(id)
      .pipe(
        map((warehouse) => WarehousesActions.getWarehouseSuccess({ current: warehouse })),
        catchError((err) => of(WarehousesActions.getWarehouseFailed(err)))
      ))
  ));

  editWarehouseEffect$ = createEffect(() => this.actions$.pipe(
    ofType(WarehousesActions.editWarehouse),
    concatLatestFrom(() => this.store.select(getActiveWarehouseChanges)),
    // tap(res => console.log(res))
    exhaustMap(([_, warehouse]) => this.warehouseService.editWarehouse(warehouse?.id!, warehouse as PartialWarehouse)
      .pipe(
        concatMap((warehouse) => [
          WarehousesActions.editWarehouseSuccess({ warehouse }),
          RouterActions.go({ path: ["/warehouses"] })
        ]),
        catchError((err) => of(WarehousesActions.editWarehouseFailed(err)))
      ))
  ));

  deleteWarehouseEffect$ = createEffect(() => this.actions$.pipe(
    ofType(WarehousesActions.deleteWarehouse),
    exhaustMap(({ id  }) => this.warehouseService.deleteWarehouse(id)
      .pipe(
        map((warehouse) => WarehousesActions.loadWarehouses({ query: { query: {}, options: { limit: 10, page: 1 } } })),
        catchError((err) => of(WarehousesActions.editWarehouseFailed(err)))
      ))
  ));

  loadWarehouseEffect$ = createEffect(() => this.actions$.pipe(
    ofType(WarehousesActions.loadWarehouses),
    exhaustMap(({ query }) => this.warehouseService.loadWarehouses(query)
      .pipe(
        map((warehouses) => WarehousesActions.loadWarehousesSuccess({ warehouses })),
        catchError((err) => {
          return of(WarehousesActions.loadWarehousesFailed(err));
        })
      ))
  ));

  loadWarehouseProductsEffect$ = createEffect(() => this.actions$.pipe(
    ofType(WarehousesActions.loadWarehouseProducts),
    exhaustMap(({ id, query }) => this.warehouseService.loadProductsOnWarehouses(id, query)
      .pipe(
        map((warehouse) => WarehousesActions.loadWarehouseProductsSuccess({ warehouse })),
        catchError((err) => {
          return of(WarehousesActions.loadWarehousesFailed(err));
        })
      ))
  ));

  manageNotificationWarehousesErrorEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      WarehousesActions.getWarehouseFailed,
      WarehousesActions.addWarehouseFailed,
      WarehousesActions.loadWarehousesFailed,
      WarehousesActions.editWarehouseFailed,
      WarehousesActions.deleteWarehouseFailed,
      WarehousesActions.loadWarehouseProductsFailed
    ]),
    exhaustMap((err) => [
      UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.ERROR, message: err.error.reason?.message || "" } })
    ])
  ));

  constructor(private actions$: Actions,
              private warehouseService: WarehousesService,
              private store: Store) {}
}
