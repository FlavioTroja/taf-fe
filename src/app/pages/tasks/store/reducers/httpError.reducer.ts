import { HttpError } from "../../../../models/Notification";
import { Action, createReducer } from "@ngrx/store";

const initialState: Partial<HttpError> = {};

const httpErrorReducer = createReducer(
  initialState,
);

export function reducer(state: Partial<HttpError> | undefined, action: Action) {
  return httpErrorReducer(state, action)
}
