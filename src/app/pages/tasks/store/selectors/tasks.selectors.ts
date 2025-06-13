import { createSelector } from "@ngrx/store";
import { selectTasksManager, TasksManagementState } from "../reducers";

export const getTasksPaginatedDocs = createSelector(
  selectTasksManager,
  (state?: TasksManagementState) => state?.tasks?.docs
)

export const getTasksFilter = createSelector(
  selectTasksManager,
  (state?: TasksManagementState) => state?.filters || {}
);
