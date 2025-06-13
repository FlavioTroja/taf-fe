import { Action, createReducer, on } from "@ngrx/store";
import * as CustomersActions from "../actions/customers.actions";
import { CustomerFilter } from "../../../../models/Customer";
import { Query } from "../../../../../global";


const initialState: Query<CustomerFilter> = {
  query: {
    value: ""
  },
  options: {
    limit: 10,
    page: 1
  }
}

const customersFilterReducer = createReducer(
  initialState,
  on(CustomersActions.editCustomerFilterSuccess, (state, { filters }) => ({
      query: filters.query || {},
      options: filters.options || {}
  })),
  on(CustomersActions.clearCustomerFilter, (state) => ({

  }))
);

export function reducer(state: Query<CustomerFilter> | undefined, action: Action) {
  return customersFilterReducer(state, action)
}
