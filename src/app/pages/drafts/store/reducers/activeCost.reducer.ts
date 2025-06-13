import { Action, createReducer, on } from "@ngrx/store";
import * as DraftsActions from "../../../drafts/store/actions/drafts.actions";
import { ActiveEntity } from "../../../../../global";
import { Cost } from "../../../../models/Setup";

const initialState: Partial<ActiveEntity<Cost[]>> = {};

const setupFilterReducer = createReducer(
  initialState,
  on(DraftsActions.editCostsActiveChanges, (state, { changes }) => ({
    ...state,
    changes
  })),
  on(DraftsActions.clearCostsActiveChanges, (state) => ({
    ...state,
    changes: undefined
  })),
);

export function reducer(state: Partial<ActiveEntity<Cost[]>> | undefined, action: Action) {
  return setupFilterReducer(state, action);
}
