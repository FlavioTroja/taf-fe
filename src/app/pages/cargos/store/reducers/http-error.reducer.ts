import { Action, createReducer, on } from "@ngrx/store";
import * as CargoActions from "../actions/cargos.actions";
import { HttpError } from "../../../../models/Notification";

const initialState: Partial<HttpError> = {};

const httpErrorReducer = createReducer(
  initialState,
  on(CargoActions.clearCargoHttpError, (state, { }) => ({})),

  on(CargoActions.loadCargosFailed, (state, { error }) => ({
    ...error
  })),
  on(CargoActions.getCargoFailed, (state, { error }) => ({
    ...error
  })),
  on(CargoActions.createCargoFailed, (state, { error }) => ({
    ...error
  })),
  on(CargoActions.batchCargoFailed, (state, { error }) => ({
    ...error
  })),
);

export function reducer(state: Partial<HttpError> | undefined, action: Action) {
  return httpErrorReducer(state, action)
}
