import { createSelector } from "@ngrx/store";
import { selectUsersManager, UserManagementState } from "../reducers";

export const getUsersPaginate = createSelector(
  selectUsersManager,
  (state?: UserManagementState) => state?.users
)

export const getCurrentUser = createSelector(
  selectUsersManager,
  (state?: UserManagementState) => state?.active?.current
)

export const selectActiveUserRoles = createSelector(
  selectUsersManager,
  (state?: UserManagementState) => state?.active?.current?.roles
)

export const getActiveUserChanges = createSelector(
  selectUsersManager,
  (state?: UserManagementState) => state?.active?.changes ?? {}
)

export const getUsersHttpError = createSelector(
  selectUsersManager,
  (state?: UserManagementState) => state?.httpError
)

export const getNewPassword = createSelector(
  selectUsersManager,
  (state?: UserManagementState) => state?.changePassword?.newPassword ?? {}
)
