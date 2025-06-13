import { createSelector } from "@ngrx/store";
import { selectCargosManager, CargoManagementState } from "../reducers";

export const getCargosPaginate = createSelector(
  selectCargosManager,
  (state?: CargoManagementState) => state?.cargos
)

export const getCurrentCargo = createSelector(
  selectCargosManager,
  (state?: CargoManagementState) => state?.active?.current
)

export const getActiveCargoChanges = createSelector(
  selectCargosManager,
  (state?: CargoManagementState) => state?.active?.changes ?? {}
)

export const getCargosHttpError = createSelector(
  selectCargosManager,
  (state?: CargoManagementState) => state?.httpError
)

export const getActiveBatchCargoItems = createSelector(
    selectCargosManager,
    (state?: CargoManagementState) => {
      if(!state?.bulk?.items?.length) {
        return {};
      }
      return { ok: true };
    }
)

export const getActiveBulk = createSelector(
  selectCargosManager,
  (state?: CargoManagementState) => state?.bulk ?? {}
)

// export const getActiveBatchCargo = createSelector(
//     selectCargosManager,
//     (state?: CargoManagementState) => state?.activeBatch?.current
// )

export const getCargoFilter = createSelector(
  selectCargosManager,
  (state?: CargoManagementState) => state?.filters
)

export const getCargoBulkItems = createSelector(
  selectCargosManager,
  (state?: CargoManagementState) => state?.bulk?.items
);
