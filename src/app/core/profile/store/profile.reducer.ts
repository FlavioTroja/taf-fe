import { PartialUser } from "../../../models/User";
import { createReducer, on, Action } from "@ngrx/store";
import * as ProfileActions from "./profile.actions";
import * as AuthActions from "../../auth/store/auth.actions";

export interface ProfileState {
    user: PartialUser,
  error: boolean
}
export const initialState: ProfileState = {
  user: {} as PartialUser,
  error: false
}

const profileReducer = createReducer(
  initialState,
  on(ProfileActions.loadProfileSuccess, (state, { user }) => ({
    user: { ...user },
    error: false
  })),
  on(ProfileActions.loadProfileFailed, (state) => ({
    ...state,
    error: true
  })),
  on(ProfileActions.editProfileSuccess, (state, { user }) => ({
    user: { ...user },
    error: false
  })),
  on(ProfileActions.editProfileFailed, (state) => ({
    ...state,
    error: false
  })),
  on(AuthActions.logoutSuccess, (state) => ({
    user: {} as PartialUser,
    error: false
  }))
);

export function reducer(state: ProfileState | undefined, action: Action) {
  return profileReducer(state, action)
}
