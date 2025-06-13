import { Action, createReducer } from "@ngrx/store";
import { HttpError } from "../../../../models/Notification";

const initialState: Partial<HttpError> = {};

const httpErrorReducer = createReducer(
  initialState,
);

export function reducer(state: Partial<HttpError> | undefined, action: Action) {
  return httpErrorReducer(state, action)
}
