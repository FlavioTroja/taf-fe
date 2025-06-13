import { createSelector } from "@ngrx/store";
import { selectTaskStepsManager, TaskStepManagementState } from "../reducers";

export const getTaskStepsPaginate = createSelector(
  selectTaskStepsManager,
  (state?: TaskStepManagementState) => state?.taskSteps
)

export const getTaskStepsPaginatedDocs = createSelector(
  selectTaskStepsManager,
  (state?: TaskStepManagementState) => state?.taskSteps?.docs
)

export const getTaskStepsFilter = createSelector(
  selectTaskStepsManager,
  (state?: TaskStepManagementState) => state?.filters || {}
);

export const getCurrentTaskStep = createSelector(
  selectTaskStepsManager,
  (state?: TaskStepManagementState) => state?.activeTaskStep?.current
)

export const getTaskStepCompletionFormActiveChanges = createSelector(
  selectTaskStepsManager,
  (state?: TaskStepManagementState) => state?.taskStepCompletionForm?.changes || {}
);
