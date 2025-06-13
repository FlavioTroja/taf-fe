import { Action, createReducer, on } from "@ngrx/store";
import * as ProductActions from "../actions/products.actions";
import { Product } from "../../../../models/Product";
import { ActiveEntity } from "../../../../../global";

const initialState: Partial<ActiveEntity<Product>> = {};

const activeProductReducer = createReducer(
  initialState,
  on(ProductActions.getProductSuccess, (state, { current }) => ({
    current: current
  })),
  on(ProductActions.productActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
  on(ProductActions.changeBuyingPriceProduct, (state, { changes }) => ({
    changes: { ...changes }
  })),
  on(ProductActions.editProductSuccess, (state, { product }) => ({
    current: { ...product }
  })),
  on(ProductActions.clearProductActive, (state) => ({
    changes: undefined,
    current: undefined
  })),
  on(ProductActions.loadProductsSuccess, (state) => ({
    changes: undefined,
    current: undefined
  })),
);

export function reducer(state: Partial<ActiveEntity<Product>> | undefined, action: Action) {
  return activeProductReducer(state, action)
}
