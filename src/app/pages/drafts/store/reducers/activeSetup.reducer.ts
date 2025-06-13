import { Action, createReducer, on } from "@ngrx/store";
import { ActiveEntity } from "../../../../../global";
import { Setup } from "../../../../models/Setup";
import * as DraftsActions from "../actions/drafts.actions";

const initialState: Partial<ActiveEntity<Setup>> = {};

const activeSetupReducer = createReducer(
    initialState,
    on(DraftsActions.getSetupSuccess, (state, { current }) => ({
        current: { ...current }
    })),
    on(DraftsActions.setupActiveChanges, (state, { changes }) => ({
      ...state,
      changes: { ...changes }
    })),
    on(DraftsActions.clearSetupChanges, (state) => ({
        ...state,
        changes: {}
    })),
    on(DraftsActions.clearSetupActive, (_) => ({
      current: undefined,
      changes: {}
    })),
    on(
      DraftsActions.quoteDraftSuccess,
      DraftsActions.backToDraftSuccess,
      DraftsActions.confirmQuoteSuccess,
      (state, { newStatus }) => ({
        ...state,
        current: { ...(state.current), setupStatus: newStatus } as Setup
      })
    ),
);

export function reducer(state: Partial<ActiveEntity<Setup>> | undefined, action: Action) {
    return activeSetupReducer(state, action)
}
