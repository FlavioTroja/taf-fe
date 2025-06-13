import { Action, createReducer, on } from "@ngrx/store";
import * as ResourceActions from "../actions/resources.actions";
import { HttpError } from "../../../../models/Notification";

const initialState: Partial<HttpError> = {};

const httpErrorReducer = createReducer(
  initialState,
  on(ResourceActions.clearResourceHttpError, (state, { }) => ({})),

  on(ResourceActions.loadResourcesFailed, (state, { error }) => ({
    ...error
  })),
  on(ResourceActions.getResourceFailed, (state, { error }) => ({
    ...error
  })),
  on(ResourceActions.editResourceFailed, (state, { error }) => ({
    ...error
  })),
  on(ResourceActions.deleteResourceFailed, (state, { error }) => ({
    ...error
  })),
  on(ResourceActions.addResourceFailed, (state, { error }) => ({
    ...error
  }))
);

export function reducer(state: Partial<HttpError> | undefined, action: Action) {
  return httpErrorReducer(state, action)
}
