import { createAction, props } from "@ngrx/store";
import { Auth, ConfirmPayload, LoginPayload, RegisterPayload, RegisterResponse } from "../../../models/Auth";
import { HttpError } from "../../../models/Notification";

export const login = createAction("[Auth] Login", props<LoginPayload>());

export const loginSuccess = createAction("[Auth] Login Success", props<{ auth: Auth }>());

export const loginFailed = createAction("[Auth] Login Failed", props<{ error: HttpError }>());

export const logout = createAction("[Auth] Logout");

export const logoutSuccess = createAction("[Auth] Logout Success");

export const saveAuth = createAction("[Auth] save", props<{ auth: Auth }>());

export const unauthorizedToken = createAction("[Auth] Unauthorized token");

export const register = createAction("[Auth] Sign Up", props<{ payload: RegisterPayload }>());

export const registerSuccess = createAction("[Auth] Sign Up Success", props<{ registerResp: RegisterResponse }>());

export const registerFailed = createAction("[Auth] Sign Up Failed", props<{ error: HttpError }>());

export const confirm = createAction("[Auth] Confirm User", props<{ payload: ConfirmPayload }>());

export const confirmSuccess = createAction("[Auth] Confirm Success");

export const confirmFailed = createAction("[Auth] Confirm Failed", props<{ error: HttpError }>());
