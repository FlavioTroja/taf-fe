import { Action, createReducer, on } from "@ngrx/store";
import { Customer } from "../../../../models/Customer";
import { ActiveEntity } from "../../../../../global";
import * as CustomerActions from "../actions/customers.actions";

const initialState: Partial<ActiveEntity<Customer>> = {};

const formCustomerReducer = createReducer(
  initialState,
  on(CustomerActions.newCustomerFormActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
  on(CustomerActions.newClearCustomerFormActiveChanges, (state) => ({
    ...state,
    changes: {}
  })),

);

export function reducer(state: Partial<ActiveEntity<Customer>> | undefined, action: Action) {
  return formCustomerReducer(state, action)
}
