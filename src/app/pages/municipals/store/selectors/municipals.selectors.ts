import { createSelector } from "@ngrx/store";
import { MunicipalsManagementState, selectMunicipalsManager } from "../reducers";

export const getMunicipalsPaginate = createSelector(
  selectMunicipalsManager,
  (state?: MunicipalsManagementState) => state?.municipals
)

export const getActiveMunicipal = createSelector(
  selectMunicipalsManager,
  (state?: MunicipalsManagementState) => state?.active?.current
)

export const getActiveMunicipalChanges = createSelector(
  selectMunicipalsManager,
  (state?: MunicipalsManagementState) => state?.active?.changes
)
