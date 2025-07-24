import { createSelector } from "@ngrx/store";
import { ActivitiesManagementState, selectActivitiesManager } from "../reducers";

export const getActivitiesPaginate = createSelector(
  selectActivitiesManager,
  (state?: ActivitiesManagementState) => state?.activities
)

export const getActiveActivity = createSelector(
  selectActivitiesManager,
  (state?: ActivitiesManagementState) => state?.active?.current
)

export const getActiveActivityChanges = createSelector(
  selectActivitiesManager,
  (state?: ActivitiesManagementState) => state?.active?.changes ?? {}
)
