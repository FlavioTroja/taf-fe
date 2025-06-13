import { Action, createReducer, on } from "@ngrx/store";
import * as UserActions from "../actions/users.actions";

export interface ChangePassword {
  newPassword: string
}

const initialState: Partial<ChangePassword> = {};

const changePasswordReducer = createReducer(
  initialState,
  on(UserActions.editChangePasswordForm, (state, { newPassword }) => ({
    newPassword
  })),
  on(UserActions.clearChangePasswordForm, (state) => ({
    newPassword: undefined
  }))
);

export function reducer(state: Partial<ChangePassword> | undefined, action: Action) {
  return changePasswordReducer(state, action);
}
