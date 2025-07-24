import { Action, createReducer, on } from "@ngrx/store";
import { ActiveEntity } from "../../../../../global";
import { Activity } from "../../../../models/Activities";
import * as ActivitiesActions from "../actions/activities.actions";


const initialState: Partial<ActiveEntity<Activity>> = {}

const activeActivityReducer = createReducer(
  initialState,
  on(ActivitiesActions.getActivitySuccess, (state, { current }) => ({
    current,
  })),
  on(ActivitiesActions.activityActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
  on(ActivitiesActions.clearActivityActive, (state) => ({
    changes: undefined,
    current: undefined
  }))
)

export function reducer(state: Partial<ActiveEntity<Activity>> | undefined, action: Action) {
  return activeActivityReducer(state, action)
}
