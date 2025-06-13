import { createSelector } from "@ngrx/store";
import { selectCustomersManager, CustomerManagementState } from "../reducers";

export const getCustomersPaginate = createSelector(
  selectCustomersManager,
  (state?: CustomerManagementState) => state?.customers
)

export const getCurrentCustomer = createSelector(
  selectCustomersManager,
  (state?: CustomerManagementState) => state?.active?.current
)

export const getActiveCustomerChanges = createSelector(
  selectCustomersManager,
  (state?: CustomerManagementState) => state?.active?.changes ?? {}
)

export const getCustomersHttpError = createSelector(
  selectCustomersManager,
  (state?: CustomerManagementState) => state?.httpError
)

export const getCustomerFilter = createSelector(
  selectCustomersManager,
  (state?: CustomerManagementState) => state?.filters
);

export const getCustomerAddressFormActiveChanges = createSelector(
  selectCustomersManager,
  (state?: CustomerManagementState) => state?.addressForm?.changes || {}
);

export const getNewCustomerFormActiveChanges = createSelector(
  selectCustomersManager,
  (state?: CustomerManagementState) => state?.newCustomerForm?.changes || {}
);

