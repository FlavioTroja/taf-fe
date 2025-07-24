import { Action, createReducer, on } from "@ngrx/store";
import { Event } from "../../../../models/Event";
import { PaginateDatasource } from "../../../../models/Table";
import * as EventActions from "../actions/events.actions";


const initialState: Partial<PaginateDatasource<Event>> = {};

const eventsReducer = createReducer(
  initialState,
  on(EventActions.loadPaginateEventsSuccess, (state, { events }) => ({
    ...events
  })),
)

export function reducer(state: Partial<PaginateDatasource<Event>> | undefined, action: Action) {
  return eventsReducer(state, action)
}
