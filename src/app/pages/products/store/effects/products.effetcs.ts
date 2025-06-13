import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { ProductsService } from "../../services/products.service";
import { catchError, concatMap, exhaustMap, map, of } from "rxjs";
import * as ProductsActions from "../actions/products.actions";
import { Store } from "@ngrx/store";
import { getActiveProductChanges, getProductFilter } from "../selectors/products.selectors";
import { BuyingPrice, PartialProduct } from "../../../../models/Product";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";
import * as UIActions from "../../../../core/ui/store/ui.actions";


@Injectable({
  providedIn: 'root'
})
export class ProductsEffects  {

  addProductEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ProductsActions.addProduct),
    exhaustMap(({ product }) => this.productService.addProduct(product)
      .pipe(
        concatMap((product) => [
          ProductsActions.addProductSuccess({ product }),
          RouterActions.go({ path: [`/products/${product.id}/view`] })
        ]),
        catchError((err) => of(ProductsActions.addProductFailed(err)))
      ))
  ));

  getProductEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ProductsActions.getProduct),
    exhaustMap(({ id, params }) => this.productService.getProduct(id, params)
      .pipe(
        map((product) => ProductsActions.getProductSuccess({ current: product })),
        catchError((err) => of(ProductsActions.getProductFailed(err)))
      ))
  ));

  getProductFailedEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ProductsActions.getProductFailed),
    exhaustMap(() => [
      RouterActions.go({ path: ["/products"] })
    ])
  ));

  editProductEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ProductsActions.editProduct),
    concatLatestFrom(() => [
      this.store.select(getActiveProductChanges)
    ]),
    // tap(res => console.log(res))
    exhaustMap(([_, changes]) => {
      if(isNaN(changes.id!)) {
        return of(ProductsActions.addProduct({ product: changes as PartialProduct }));
      }
      return this.productService.editProduct(changes?.id!, changes as PartialProduct)
        .pipe(
          concatMap((product) => [
            // ProductsActions.editProductSuccess({ product }),
            RouterActions.go({ path: ["/products"] })
          ]),
          catchError((err) => of(ProductsActions.editProductFailed(err)))
        )
    })
  ));

  editProductPriceEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ProductsActions.changeBuyingPriceProduct),
    exhaustMap(({ productOpts: { id, populate }, changes }) => this.productService.editProductPrice(id, changes as Partial<BuyingPrice>)
      .pipe(
          // tap(x => console.log(x)),
          concatMap((product) => [
            ProductsActions.changeBuyingPriceProductSuccess(),
            ProductsActions.getProduct({ id: +product.id!, params: { populate } })
            // RouterActions.go({ path: [`/products/${product.id}/view`] })
          ]),
          catchError((err) => of(ProductsActions.changeBuyingPriceProductFailed(err)))
      )
    )
  ));

  deleteProductEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ProductsActions.deleteProduct),
    exhaustMap(({ id  }) => this.productService.deleteProduct(id)
      .pipe(
        map((product) => ProductsActions.loadProducts()),
        catchError((err) => of(ProductsActions.editProductFailed(err)))
      ))
  ));

  deleteProductFromViewEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ProductsActions.deleteProductFromView),
    exhaustMap(({ id  }) => this.productService.deleteProduct(id)
      .pipe(
        map((product) => RouterActions.go({ path: ["products"] })),
        catchError((err) => of(ProductsActions.editProductFailed(err)))
      ))
  ));

  loadProductEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ProductsActions.loadProducts),
    concatLatestFrom(() => [
      this.store.select(getProductFilter)
    ]),
    exhaustMap(([ _, query ]) => this.productService.loadProducts(query!)
      .pipe(
        concatMap((products) => [
          ProductsActions.loadProductsSuccess({ products }),
          ProductsActions.clearProductActive()
        ]),
        catchError((err) => {
          return of(ProductsActions.loadProductsFailed(err));
        })
      ))
  ));

  editProductFilterEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ProductsActions.editProductFilter),
    concatMap(({ filters }) => [
      ProductsActions.editProductFilterSuccess({ filters }),
      ProductsActions.loadProducts()
    ])
  ));

  copyProductEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ProductsActions.copyProduct),
    exhaustMap(({ id }) => this.productService.getProduct(id, { populate: "categories suppliers" })
      .pipe(
        map((product) => ({
          ...product,
          id: undefined,
          sku: undefined,
          name: `Copia di ${product.name}`,
          // Ricordarsi di aggiungere supplier
          relations: [{
            key: "categories",
            field: "category",
            ids: product.categories?.map(c => c.categoryId)
          }]
        })),
        map((product) => ProductsActions.addProduct({ product })),
      ))
  ));

  manageNotificationProductsErrorEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      ProductsActions.editProductFailed,
      ProductsActions.getProductFailed,
      ProductsActions.loadProductsFailed,
      ProductsActions.addProductFailed,
      ProductsActions.changeBuyingPriceProductFailed,
      ProductsActions.deleteProductFailed
    ]),
    exhaustMap((err) => [
      UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.ERROR, message: err.error.reason?.message || "" } })
    ])
  ));

  constructor(private actions$: Actions,
              private productService: ProductsService,
              private store: Store) {}
}
