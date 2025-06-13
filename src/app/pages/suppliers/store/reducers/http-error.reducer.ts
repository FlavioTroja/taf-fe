import { Action, createReducer, on } from "@ngrx/store";
import * as SupplierActions from "../actions/suppliers.actions";
import { HttpError } from "../../../../models/Notification";

const initialState: Partial<HttpError> = {};

const httpErrorReducer = createReducer(
  initialState,
  on(SupplierActions.clearSupplierHttpError, (state, { }) => ({})),

  on(SupplierActions.loadSuppliersFailed, (state, { error }) => ({
    ...error
  })),
  on(SupplierActions.getSupplierFailed, (state, { error }) => ({
    ...error
  })),
  on(SupplierActions.editSupplierFailed, (state, { error }) => ({
    ...error
  })),
  on(SupplierActions.deleteSupplierFailed, (state, { error }) => ({
    ...error
  }))
);

export function reducer(state: Partial<HttpError> | undefined, action: Action) {
  return httpErrorReducer(state, action)
}
