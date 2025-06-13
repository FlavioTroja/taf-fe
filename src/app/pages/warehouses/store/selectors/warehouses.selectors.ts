import { createSelector } from "@ngrx/store";
import { selectWarehousesManager, WarehouseManagementState } from "../reducers";

export const getWarehousesPaginate = createSelector(
    selectWarehousesManager,
    (state?: WarehouseManagementState) => state?.warehouses
)

export const getCurrentWarehouse = createSelector(
  selectWarehousesManager,
  (state?: WarehouseManagementState) => state?.active?.current
)

export const getActiveWarehouseChanges = createSelector(
  selectWarehousesManager,
  (state?: WarehouseManagementState) => state?.active?.changes ?? {}
)

export const getWarehouseProducts = createSelector(
  selectWarehousesManager,
  (state?: WarehouseManagementState) => state?.products
)

export const getNameWarehouseProducts = createSelector(
  selectWarehousesManager,
  (state?: WarehouseManagementState) => state?.products?.name ?? {}
)

export const getWarehousesHttpError = createSelector(
  selectWarehousesManager,
  (state?: WarehouseManagementState) => state?.httpError
)
