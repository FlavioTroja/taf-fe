import { Action, createReducer, on } from "@ngrx/store";
import * as CustomerActions from "../actions/customers.actions";
import { HttpError } from "../../../../models/Notification";

const initialState: Partial<HttpError> = {};

const httpErrorReducer = createReducer(
  initialState,
  on(CustomerActions.clearCustomerHttpError, (state, { }) => ({})),

  on(CustomerActions.loadCustomersFailed, (state, { error }) => ({
    ...error
  })),
  on(CustomerActions.getCustomerFailed, (state, { error }) => ({
    ...error
  })),
  on(CustomerActions.editCustomerFailed, (state, { error }) => ({
    ...error
  })),
  on(CustomerActions.deleteCustomerFailed, (state, { error }) => ({
    ...error
  })),
  on(CustomerActions.addCustomerFailed, (state, { error }) => ({
    ...error
  }))
);

export function reducer(state: Partial<HttpError> | undefined, action: Action) {
  return httpErrorReducer(state, action)
}
