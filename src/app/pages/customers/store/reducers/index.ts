import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { reducer as customerReducer } from "./customers.reducer";
import { reducer as httpErrorReducer } from "./http-error.reducer";
import { reducer as activeReducer } from "./active.reducer";
import { reducer as filtersReducer } from "./filters.reducer";
import { reducer as addressFormReducer } from "./addressForm.reducer";
import { reducer as newCustomerFormReducer } from "./newCustomerForm.reducer";
import { HttpError } from "../../../../models/Notification";
import { AddressOnCustomerSection, Customer, CustomerFilter } from "../../../../models/Customer";
import { PaginateDatasource } from "../../../../models/Table";
import { ActiveEntity, Query } from "../../../../../global";

export interface CustomerManagementState {
  customers?: Partial<PaginateDatasource<Customer>>;
  filters?: Query<CustomerFilter>;
  active?: Partial<ActiveEntity<Customer>>;
  addressForm?: Partial<ActiveEntity<AddressOnCustomerSection>>;
  newCustomerForm?: Partial<ActiveEntity<Customer>>;
  httpError?: Partial<HttpError>;
}

export const reducers: ActionReducerMap<CustomerManagementState> = {
  customers: customerReducer,
  filters: filtersReducer,
  active: activeReducer,
  addressForm: addressFormReducer,
  newCustomerForm: newCustomerFormReducer,
  httpError: httpErrorReducer
}

export const selectCustomersManager = createFeatureSelector<CustomerManagementState>("customer-manager");
