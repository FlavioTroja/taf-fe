import { createSelector } from "@ngrx/store";
import { NewsManagementState, selectNewsManager } from "../reducers";

export const getNewsPaginate = createSelector(
  selectNewsManager,
  (state?: NewsManagementState) => state?.news
)

export const getActiveNews = createSelector(
  selectNewsManager,
  (state?: NewsManagementState) => state?.active?.current
)

export const getActiveNewsChanges = createSelector(
  selectNewsManager,
  (state?: NewsManagementState) => state?.active?.changes ?? {}
)
