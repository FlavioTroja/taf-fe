import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { reducer as userReducer } from "./users.reducer";
import { reducer as httpErrorReducer } from "./http-error.reducer";
import { reducer as activeReducer } from "./active.reducer";
import { reducer as roleNamesReducer } from "./roleNames.reducer";
import { reducer as changePasswordReducer } from "./change-password.reducer";
import { HttpError } from "../../../../models/Notification";
import { PaginateDatasource } from "../../../../models/Table";
import { ActiveEntity } from "../../../../../global";
import { RoleName, User } from "../../../../models/User";
import { ChangePassword } from "./change-password.reducer";

export interface UserManagementState {
  users?: Partial<PaginateDatasource<User>>;
  active?: Partial<ActiveEntity<User>>;
  roleNames?: RoleName[];
  changePassword?: Partial<ChangePassword>;
  httpError?: Partial<HttpError>;
}

export const reducers: ActionReducerMap<UserManagementState> = {
  users: userReducer,
  active: activeReducer,
  roleNames: roleNamesReducer,
  changePassword: changePasswordReducer,
  httpError: httpErrorReducer
}

export const selectUsersManager = createFeatureSelector<UserManagementState>("user-manager");
