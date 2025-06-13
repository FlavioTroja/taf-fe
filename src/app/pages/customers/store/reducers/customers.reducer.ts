import { Action, createReducer, on } from "@ngrx/store";
import * as CustomersActions from "../actions/customers.actions";
import { Customer } from "../../../../models/Customer";
import { PaginateDatasource } from "../../../../models/Table";


const initialState: Partial<PaginateDatasource<Customer>> = {}

const customersReducer = createReducer(
  initialState,
  on(CustomersActions.loadCustomersSuccess, (state, { customers }) => ({
    ...customers
  }))
);

export function reducer(state: Partial<PaginateDatasource<Customer>> | undefined, action: Action) {
  return customersReducer(state, action)
}
