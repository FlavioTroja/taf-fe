import { Action, createReducer, on } from "@ngrx/store";
import * as ProductActions from "../actions/products.actions";
import { HttpError } from "../../../../models/Notification";

const initialState: Partial<HttpError> = {};

const httpErrorReducer = createReducer(
  initialState,
  on(ProductActions.clearProductHttpError, (state, { }) => ({})),

  on(ProductActions.loadProductsFailed, (state, { error }) => ({
    ...error
  })),
  on(ProductActions.getProductFailed, (state, { error }) => ({
    ...error
  })),
  on(ProductActions.editProductFailed, (state, { error }) => ({
    ...error
  })),
  on(ProductActions.changeBuyingPriceProductFailed, (state, { error }) => ({
    ...error
  })),
  on(ProductActions.deleteProductFailed, (state, { error }) => ({
    ...error
  })),
  on(ProductActions.addProductFailed, (state, { error }) => ({
    ...error
  }))
);

export function reducer(state: Partial<HttpError> | undefined, action: Action) {
  return httpErrorReducer(state, action)
}
