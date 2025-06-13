import { createSelector } from "@ngrx/store";
import { UserManagementState, selectUsersManager } from "../reducers";

export const getRoleNames = createSelector(
  selectUsersManager,
  (state?: UserManagementState) => state?.roleNames
);
