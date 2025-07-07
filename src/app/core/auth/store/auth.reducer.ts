import { Action, createReducer, on } from "@ngrx/store";
import { HttpError } from "../../../models/Notification";
import * as AuthActions from "./auth.actions";

export interface AuthState {
  access_token?: string,
  httpError?: HttpError,
  loading?: boolean,
  userConfirmed?: boolean,
}

export const initialState: AuthState = {}

const authReducer = createReducer(
  initialState,
  on(AuthActions.saveAuth, (state, { auth }) => ({
    access_token: createAuthorizationToken(auth.access_token)
  })),
  on(AuthActions.login, (state, payload) => ({
    loading: true,
  })),
  on(AuthActions.loginSuccess, (state, payload) => ({
    loading: false,
  })),
  on(AuthActions.confirm, (state, payload) => ({
    loading: true,
  })),
  on(AuthActions.confirmSuccess, (state, payload) => ({
    loading: false,
  })),
  on(AuthActions.confirmFailed, (state, { error }) => ({
    loading: false,
    httpError: { ...error }
  })),
  on(AuthActions.register, (state, payload) => ({
    loading: true,
  })),
  on(AuthActions.registerSuccess, (state, payload) => ({
    loading: false,
  })),
  on(AuthActions.loginSuccess, (state, { auth }) => ({
    access_token: createAuthorizationToken(auth.access_token),
    loading: false,
  })),
  on(AuthActions.loginFailed, (state, { error }) => ({
    httpError: { ...error },
    loading: false,
  })),
  on(AuthActions.registerFailed, (state, { error }) => ({
    httpError: { ...error },
    loading: false
  })),
  on(AuthActions.logoutSuccess, (state) => ({
    access_token: undefined,
    loading: false,
  }))
);

function createAuthorizationToken(token?: string) {
  return `Bearer ${ token }`;
}


export function reducer(state: AuthState | undefined, action: Action) {
  return authReducer(state, action)
}
