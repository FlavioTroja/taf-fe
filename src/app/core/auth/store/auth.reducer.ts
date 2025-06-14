import { Action, createReducer, on } from "@ngrx/store";
import * as AuthActions from "./auth.actions";
import { HttpError } from "../../../models/Notification";

export interface AuthState {
  accessToken?: string,
  httpError?: HttpError
}
export const initialState: AuthState = {}

const authReducer = createReducer(
  initialState,
  on(AuthActions.saveAuth, (state, {auth }) => ({
    accessToken: createAuthorizationToken(auth.token)
  })),
  on(AuthActions.loginSuccess, (state, {auth }) => ({
    accessToken: createAuthorizationToken(auth.token)
  })),
  on(AuthActions.loginFailed, (state, { error }) => ({
    httpError: { ...error }
  })),
  on(AuthActions.logoutSuccess, (state) => ({
    accessToken: undefined
  }))
);

function createAuthorizationToken(token?: string) {
  return `Bearer ${token}`;
}


export function reducer(state: AuthState | undefined, action: Action) {
  return authReducer(state, action)
}
