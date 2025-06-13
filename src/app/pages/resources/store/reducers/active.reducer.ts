import { Action, createReducer, on } from "@ngrx/store";
import * as ResourceActions from "../actions/resources.actions";
import { Resource } from "../../../../models/Resource";
import { ActiveEntity } from "../../../../../global";

const initialState: Partial<ActiveEntity<Resource>> = {};

const activeResourceReducer = createReducer(
  initialState,
  on(ResourceActions.getResourceSuccess, (state, { current }) => ({
    current: current
  })),
  on(ResourceActions.resourceActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
  on(ResourceActions.editResourceSuccess, (state, { resource }) => ({
    current: { ...resource }
  })),
  on(ResourceActions.clearResourceActive, (state) => ({
    changes: undefined,
    current: undefined
  })),
  on(ResourceActions.loadResourcesSuccess, (state) => ({
    changes: undefined,
    current: undefined
  })),
);

export function reducer(state: Partial<ActiveEntity<Resource>> | undefined, action: Action) {
  return activeResourceReducer(state, action)
}
