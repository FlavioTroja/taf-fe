import { createReducer, on, Action } from "@ngrx/store";
import * as ConfigActions from "./hide.actions";

export interface HideState {
    sections: string[],
    error: boolean
}
export const initialState: HideState = {
    sections: [],
    error: false
}

const hideReducer = createReducer(
  initialState,
  on(ConfigActions.ownSuccessful, (state, { sections }) => ({
    sections: sections,
    error: false
  })),
);

export function reducer(state: HideState | undefined, action: Action) {
  return hideReducer(state, action)
}
