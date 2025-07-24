import { createSelector } from "@ngrx/store";
import { EventsManagementState, selectEventsManager } from "../reducers";

export const getEventsPaginate = createSelector(
  selectEventsManager,
  (state?: EventsManagementState) => state?.events
)

export const getActiveEvent = createSelector(
  selectEventsManager,
  (state?: EventsManagementState) => state?.active?.current
)

export const getActiveEventChanges = createSelector(
  selectEventsManager,
  (state?: EventsManagementState) => state?.active?.changes ?? {}
)
