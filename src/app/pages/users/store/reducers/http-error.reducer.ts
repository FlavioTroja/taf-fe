import { Action, createReducer, on } from "@ngrx/store";
import { HttpError } from "../../../../models/Notification";
import * as UsersAction from "../actions/users.actions";

const initialState: Partial<HttpError> = {};

const httpErrorReducer = createReducer(
  initialState,
  on(UsersAction.clearUserHttpError, (state, {}) => ({})),

  on(UsersAction.loadPaginateUsersFailed, (state, { error }) => ({
    ...error
  })),
  on(UsersAction.getUserFailed, (state, { error }) => ({
    ...error
  })),
  on(UsersAction.editUserFailed, (state, { error }) => ({
    ...error
  })),
  on(UsersAction.deleteUserFailed, (state, { error }) => ({
    ...error
  })),
  on(UsersAction.getRolesNamesFailed, (state, { error }) => ({
    ...error
  }))
);

export function reducer(state: Partial<HttpError> | undefined, action: Action) {
  return httpErrorReducer(state, action)
}
