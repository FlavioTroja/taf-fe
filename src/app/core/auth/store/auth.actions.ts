import { createAction, props } from "@ngrx/store";
import { LoginPayload, Auth } from "../../../models/Auth";
import { HttpError } from "../../../models/Notification";

export const login = createAction("[Auth] Login", props<LoginPayload>());

export const loginSuccess = createAction("[Auth] Login Success", props<{ auth: Auth }>());

export const loginFailed = createAction("[Auth] Login Failed", props<{ error: HttpError }>());

export const logout = createAction("[Auth] Logout");

export const logoutSuccess = createAction("[Auth] Logout Success");

export const saveAuth = createAction("[Auth] save", props<{ auth: Auth }>());

export const unauthorizedToken = createAction("[Auth] Unauthorized token");
