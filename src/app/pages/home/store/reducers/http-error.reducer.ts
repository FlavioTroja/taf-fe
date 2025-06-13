import { Action, createReducer, on } from "@ngrx/store";
import * as DashboardActions from "../actions/dashboard.actions";
import { HttpError } from "../../../../models/Notification";

const initialState: Partial<HttpError> = {};

const httpErrorReducer = createReducer(
  initialState,
  on(DashboardActions.getDashboardInvoiceStatisticsFailed, (state, { error }) => ({
    ...error
  })),
  on(DashboardActions.getDashboardWarehouseStatisticsFailed, (state, { error }) => ({
    ...error
  })),
  on(DashboardActions.getDashboardWarehouseLastStatisticFailed, (state, { error }) => ({
    ...error
  })),
);

export function reducer(state: Partial<HttpError> | undefined, action: Action) {
  return httpErrorReducer(state, action)
}
