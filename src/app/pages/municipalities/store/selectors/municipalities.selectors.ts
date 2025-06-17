import { createSelector } from "@ngrx/store";
import { MunicipalitiesManagementState, selectMunicipalitiesManager } from "../reducers";

export const getMunicipalitiesPaginate = createSelector(
  selectMunicipalitiesManager,
  (state?: MunicipalitiesManagementState) => state?.municipalities
)
