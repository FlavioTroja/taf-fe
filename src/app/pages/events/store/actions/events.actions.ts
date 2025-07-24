import { createAction, props } from "@ngrx/store";
import { QuerySearch } from "../../../../../global";
import { PartialActivity } from "../../../../models/Activities";
import { Event, PartialEvent } from "../../../../models/Event";
import { HttpError } from "../../../../models/Notification";
import { PaginateDatasource } from "../../../../models/Table";

export const deleteEvent = createAction("[Events] Delete Event]", props<{ id: string }>());
export const deleteEventFailed = createAction("[Events] Delete Event Failed]", props<{
  error: HttpError
}>());

export const loadPaginateEvents = createAction("[Events] Load Events", props<{ query: QuerySearch }>());
export const loadPaginateEventsSuccess = createAction("[Events] Load Events Success", props<{
  events: PaginateDatasource<Event>
}>())
export const loadPaginateEventsFailed = createAction("[Events] Load Events Failed", props<{
  error: HttpError
}>())

export const eventActiveChanges = createAction("[Events] On Event change prop", props<{
  changes: PartialEvent
}>());

export const getEvent = createAction("[Events] Get Active Event", props<{ id: string }>());
export const getEventSuccess = createAction("[Events] Get Active Event Success", props<{
  current: Event, activity?: PartialActivity
}>());
export const getEventFailed = createAction("[Events] Get Active Event Failed", props<{
  error: HttpError
}>());

export const addEvent = createAction("[Events] Add Events", props<{ event: PartialEvent }>());
export const addEventSuccess = createAction("[Events] Add Events Success", props<{
  event: PartialEvent
}>());
export const addEventFailed = createAction("[Events] Add Events Failed", props<{
  error: HttpError
}>());


export const editEvent = createAction("[Events] Edit Event")
export const editEventSuccess = createAction("[Events] Edit Event Success", props<{
  event: PartialEvent
}>())
export const editEventFailed = createAction("[Events] Edit Event Failed", props<{
  error: HttpError
}>())

export const clearEventActive = createAction("[Events] Clear Active changes");




