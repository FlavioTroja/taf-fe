import { createSelector } from "@ngrx/store";
import { selectUsersManager, UserManagementState } from "../reducers";

export const getUsersPaginate = createSelector(
  selectUsersManager,
  (state?: UserManagementState) => state?.users
)
