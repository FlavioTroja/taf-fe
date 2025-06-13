import { Action, createReducer, on } from "@ngrx/store";
import * as WarehouseActions from "../actions/warehouses.actions";
import { HttpError } from "../../../../models/Notification";

const initialState: Partial<HttpError> = {};

const httpErrorReducer = createReducer(
  initialState,
  on(WarehouseActions.clearWarehouseHttpError, (state, { }) => ({})),

  on(WarehouseActions.loadWarehousesFailed, (state, { error }) => ({
    ...error
  })),
  on(WarehouseActions.getWarehouseFailed, (state, { error }) => ({
    ...error
  })),
  on(WarehouseActions.editWarehouseFailed, (state, { error }) => ({
    ...error
  })),
  on(WarehouseActions.deleteWarehouseFailed, (state, { error }) => ({
    ...error
  }))
);

export function reducer(state: Partial<HttpError> | undefined, action: Action) {
  return httpErrorReducer(state, action)
}
