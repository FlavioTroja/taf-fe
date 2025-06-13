import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { CargosService } from "../../services/cargos.service";
import { catchError, concatMap, exhaustMap, map, of } from "rxjs";
import * as CargosActions from "../actions/cargos.actions";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { ProductsService } from "../../../products/services/products.service";
import {
  getActiveBulk,
  getCargoFilter
} from "../selectors/cargos.selectors";
import { Store } from "@ngrx/store";
import { BatchCargo } from "../../../../models/Cargo";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";
import { cargoType, MoveProductList } from "../../pages/bulk/create-bulk-cargos.component";

@Injectable({
  providedIn: 'root'
})
export class CargosEffects  {

  loadCargoEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CargosActions.loadCargos),
    concatLatestFrom(() => [
      this.store.select(getCargoFilter)
    ]),
    exhaustMap(([ _, query ]) => this.cargoService.loadCargos(query!)
      .pipe(
        concatMap((cargos) => [
          CargosActions.loadCargosSuccess({ cargos }),
          // CargosActions.clearCargoActive()
        ]),
        catchError((err) => {
          return of(CargosActions.loadCargosFailed(err));
        })
      ))
  ));

  editCargoFilterEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CargosActions.editCargoFilter),
    concatMap(({ filters }) => [
      CargosActions.editCargoFilterSuccess({ filters }),
      CargosActions.loadCargos()
    ]),
  ));

  getCargoEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CargosActions.getCargo),
    exhaustMap(({ id, params }) => this.cargoService.getCargo(id, params)
      .pipe(
        concatMap((product) => [
          CargosActions.getCargoSuccess({ current: product })
        ]),
        catchError((err) => of(CargosActions.getCargoFailed(err), RouterActions.go({ path: ["/cargos"] })))
      ))
  ));

  addCargoEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CargosActions.createCargo),
    exhaustMap(({ cargo: moveProductDTO }) => this.productService.moveProduct(moveProductDTO)
      .pipe(
        concatMap((cargo) => [
          CargosActions.createCargoSuccess({ cargo }),
          CargosActions.loadCargos(),
          CargosActions.clearCargoHttpError()
          // RouterActions.go({ path: [`/cargos`] })
        ]),
        catchError((err) => of(CargosActions.createCargoFailed(err)))
      ))
  ));

  addBatchCargo$ = createEffect(() => this.actions$.pipe(
    ofType(CargosActions.batchCargoCreate),
    concatLatestFrom(() => this.store.select(getActiveBulk)),
    map(([_, bulk]) => {
      const items = bulk.items as BatchCargo[];
      const changes = bulk.changes as MoveProductList;

      const adjustedItems = items.map(i => ({
        ...i,
        quantity: changes.type === cargoType.CARICO ? +i.quantity : -i.quantity
      }));

      return { adjustedItems, changes };
    }),
    exhaustMap(({ adjustedItems, changes }) => {
      if (changes.currentSupplier) {
        const products = adjustedItems.map(p => ({
          ...p,
          supplierId: changes.currentSupplier.id,
          supplier: changes.currentSupplier,
        }));

      }
      return this.productService.moveBulk({ products: adjustedItems }).pipe(
        concatMap(cargo => [
          CargosActions.batchCargoSuccess({ cargo }),
          RouterActions.go({ path: ['/cargos'] })
        ]),
        catchError(err => of(CargosActions.batchCargoFailed(err)))
      );

    })
  ));

  manageNotificationCargosErrorEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      CargosActions.getCargoFailed,
      CargosActions.batchCargoFailed,
      CargosActions.loadCargosFailed,
      CargosActions.createCargoFailed
    ]),
    exhaustMap((err) => [
      UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.ERROR, message: err.error.reason?.message || "" } })
    ])
  ));

  constructor(private actions$: Actions,
            private cargoService: CargosService,
            private productService: ProductsService,
            private store: Store
  ){}
}
