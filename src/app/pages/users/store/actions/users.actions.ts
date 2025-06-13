import { createAction, props } from "@ngrx/store";
import { PartialUser, RoleName, User, UserFilter } from "../../../../models/User";
import { HttpError } from "../../../../models/Notification";
import { Query } from "../../../../../global";
import { PaginateDatasource } from "../../../../models/Table";

export const addUser = createAction("[Users] Add", props<{ user: PartialUser }>());

export const addUserSuccess = createAction("[Users] Add User Success", props<{ user: User }>());

export const addUserFailed = createAction("[Users] Add Failed", props<{ error: HttpError }>());

export const getUser = createAction("[Users] Get", props<{ id: number }>());

export const getUserSuccess = createAction("[Users] Get User Success", props<{ current: User }>());

export const getUserFailed = createAction("[Users] Get Failed", props<{ error: HttpError }>());

export const userActiveChanges = createAction("[Users] On User change prop", props<{ changes: PartialUser }>());

export const clearUserActive = createAction("[Users] Clear Active changes");

export const editUser = createAction("[Users] Edit");

export const editUserSuccess = createAction("[Users] Edit User Success", props<{ user: User }>());

export const editUserFailed = createAction("[Users] Edit Failed", props<{ error: HttpError }>());

export const deleteUser = createAction("[Users] Delete", props<{ id: number }>());

export const deleteUserSuccess = createAction("[Users] Delete User Success", props<{ user: User }>());

export const deleteUserFailed = createAction("[Users] Delete Failed", props<{ error: HttpError }>());

export const loadUsers = createAction("[Users] Load", props<{ query: Query<UserFilter> }>());

export const loadUsersSuccess = createAction("[Users] Load Success", props<{ users: PaginateDatasource<User> }>());

export const loadUsersFailed = createAction("[Users] Load Failed", props<{ error: HttpError }>());

export const clearUserHttpError = createAction("[Users] Clear Http Error");

export const getRolesNamesSuccess = createAction("[Users] Get roles names success", props<{ roleNames: RoleName[] }>());

export const getRolesNamesFailed = createAction("[Users] Get roles names failed", props<{ error: HttpError }>());

export const changeUserPassword = createAction("[Users] Change User Password", props<{ id: number }>());
export const changeUserPasswordSuccess = createAction("[Users] Change User Password Success");
export const changeUserPasswordFailed = createAction("[Users] Change User Password Failed", props<{ error: HttpError }>());

export const editChangePasswordForm = createAction("[Users] Edit ChangePassword Form", props<{ newPassword: string }>());
export const clearChangePasswordForm = createAction("[Users] Clear Change Password");
