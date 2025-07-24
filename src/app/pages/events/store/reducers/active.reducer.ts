import { Action, createReducer, on } from "@ngrx/store";
import { ActiveEntity } from "../../../../../global";
import { Event } from "../../../../models/Event";
import * as EventActions from "../actions/events.actions";


const initialState: Partial<ActiveEntity<Event>> = {}

const activeNewsReducer = createReducer(
  initialState,
  on(EventActions.getEventSuccess, (state, { current, activity }) => ({
    current: {
      ...current,
      activity
    },
  })),
  on(EventActions.eventActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
  on(EventActions.clearEventActive, (state) => ({
    changes: undefined,
    current: undefined
  }))
)

export function reducer(state: Partial<ActiveEntity<Event>> | undefined, action: Action) {
  return activeNewsReducer(state, action)
}
