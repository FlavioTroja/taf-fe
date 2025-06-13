import { AppState } from "../../../app.config";
import { createSelector } from "@ngrx/store";
import { AuthState } from "./auth.reducer";

export const selectAuth = (state: AppState) => state.auth;

export const getAccessToken = createSelector(
  selectAuth,
  (state: AuthState) => state.accessToken
)

export const getAuthError = createSelector(
  selectAuth,
  (state: AuthState) => state?.httpError
)
