import { Action, createReducer, on } from "@ngrx/store";
import { AddressOnCustomerSection } from "../../../../models/Customer";
import { ActiveEntity } from "../../../../../global";
import * as CustomerActions from "../actions/customers.actions";


const initialState: Partial<ActiveEntity<AddressOnCustomerSection>> = {};

const activeAddressOnCustomerReducer = createReducer(
  initialState,
  on(CustomerActions.addressFormActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
  on(CustomerActions.clearAddressFormActiveChanges, (state) => ({
    ...state,
    changes: {}
  })),

);

export function reducer(state: Partial<ActiveEntity<AddressOnCustomerSection>> | undefined, action: Action) {
  return activeAddressOnCustomerReducer(state, action)
}
