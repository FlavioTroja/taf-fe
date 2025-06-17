import { Action, createReducer, on } from "@ngrx/store";
import { HttpError } from "../../../models/Notification";
import * as AuthActions from "./auth.actions";

export interface AuthState {
  access_token?: string,
  httpError?: HttpError
}

export const initialState: AuthState = {}

const authReducer = createReducer(
  initialState,
  on(AuthActions.saveAuth, (state, { auth }) => ({
    access_token: createAuthorizationToken(auth.access_token)
  })),
  on(AuthActions.loginSuccess, (state, { auth }) => ({
    access_token: createAuthorizationToken(auth.access_token)
  })),
  on(AuthActions.loginFailed, (state, { error }) => ({
    httpError: { ...error }
  })),
  on(AuthActions.logoutSuccess, (state) => ({
    access_token: undefined
  }))
);

function createAuthorizationToken(token?: string) {
  return `Bearer ${ token }`;
}


export function reducer(state: AuthState | undefined, action: Action) {
  return authReducer(state, action)
}
