import { Action, createReducer, on } from "@ngrx/store";
import { ActiveEntity } from "../../../../../global";
import { SetupForm } from "../../../../models/Setup";
import * as InspectionActions from "../actions/inspections.actions";

const initialState: Partial<ActiveEntity<SetupForm>> = {};

const httpErrorReducer = createReducer(
  initialState,
  on(InspectionActions.setupActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
  on(InspectionActions.clearSetupActive, (state) => ({
    ...state,
    changes: undefined // for the love of everything that is holy, don't set {} for clearing a value, use undefined.
  })),
);

export function reducer(state: Partial<ActiveEntity<SetupForm>> | undefined, action: Action) {
  return httpErrorReducer(state, action)
}
