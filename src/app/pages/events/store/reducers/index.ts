import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { ActiveEntity } from "../../../../../global";
import { Event } from "../../../../models/Event";
import { HttpError } from "../../../../models/Notification";
import { PaginateDatasource } from "../../../../models/Table";
import { reducer as activeEventReducer } from "./active.reducer";
import { reducer as eventsReducer } from "./events.reducer";

export interface EventsManagementState {
  events?: Partial<PaginateDatasource<Event>>;
  active?: Partial<ActiveEntity<Event>>;
  httpError?: Partial<HttpError>
}

export const reducers: ActionReducerMap<EventsManagementState> = {
  events: eventsReducer,
  active: activeEventReducer,
}

export const selectEventsManager = createFeatureSelector<EventsManagementState>('events-manager');
