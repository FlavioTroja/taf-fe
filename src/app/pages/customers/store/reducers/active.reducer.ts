import { Action, createReducer, on } from "@ngrx/store";
import * as CustomerActions from "../actions/customers.actions";
import { Customer } from "../../../../models/Customer";
import { ActiveEntity } from "../../../../../global";

const initialState: Partial<ActiveEntity<Customer>> = {};

const activeCustomerReducer = createReducer(
  initialState,
  on(CustomerActions.getCustomerSuccess, (state, { current }) => ({
    current: { ...current }
  })),
  on(CustomerActions.customerActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
  on(CustomerActions.editCustomerSuccess, (state, { customer }) => ({
    current: { ...customer }
  })),
  on(CustomerActions.clearCustomerActive, (state) => ({
    changes: undefined,
    current: undefined
  }))
);

export function reducer(state: Partial<ActiveEntity<Customer>> | undefined, action: Action) {
  return activeCustomerReducer(state, action)
}
