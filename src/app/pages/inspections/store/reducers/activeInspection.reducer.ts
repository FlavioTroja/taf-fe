import { Action, createReducer, on } from "@ngrx/store";
import * as InspectionActions from "../actions/inspections.actions";
import { ActiveEntity } from "../../../../../global";
import {Inspection} from "../../../../models/Inspection";

const initialState: Partial<ActiveEntity<Inspection>> = {};

const activeInspectionReducer = createReducer(
  initialState,
  on(InspectionActions.getInspectionSuccess, (state, { current }) => ({
    current: { ...current }
  })),
  on(InspectionActions.inspectionActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
  on(InspectionActions.editInspectionSuccess, (state, { inspection }) => ({
    current: { ...inspection }
  })),
  on(InspectionActions.clearInspectionActive, () => ({
    changes: undefined,
    current: undefined
  })),
  on(InspectionActions.clearInspectionActiveChanges, (state) => ({
    ...state,
    changes: undefined
  }))
);

export function reducer(state: Partial<ActiveEntity<Inspection>> | undefined, action: Action) {
  return activeInspectionReducer(state, action)
}
