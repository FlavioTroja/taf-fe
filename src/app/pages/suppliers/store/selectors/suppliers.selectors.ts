import { createSelector } from "@ngrx/store";
import { selectSuppliersManager, SupplierManagementState } from "../reducers";

export const getSuppliersPaginate = createSelector(
  selectSuppliersManager,
  (state?: SupplierManagementState) => state?.suppliers
)

export const getCurrentSupplier = createSelector(
  selectSuppliersManager,
  (state?: SupplierManagementState) => state?.active?.current
)

export const getActiveSupplierChanges = createSelector(
  selectSuppliersManager,
  (state?: SupplierManagementState) => state?.active?.changes ?? {}
)

export const getSuppliersHttpError = createSelector(
  selectSuppliersManager,
  (state?: SupplierManagementState) => state?.httpError
)
