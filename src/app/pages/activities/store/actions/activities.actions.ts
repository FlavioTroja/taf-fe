import { createAction, props } from "@ngrx/store";
import { QuerySearch } from "../../../../../global";
import { Activity, PartialActivity } from "../../../../models/Activities";
import { HttpError } from "../../../../models/Notification";
import { PaginateDatasource } from "../../../../models/Table";

export const deleteActivity = createAction("[Activities] Delete Activity]", props<{ id: string }>());
export const deleteActivityFailed = createAction("[Activities] Delete Activity Failed]", props<{
  error: HttpError
}>());

export const loadActivities = createAction("[Activities] Load Activities", props<{
  query: QuerySearch<string, string>
}>());
export const loadActivitiesSuccess = createAction("[Activities] Load Activities Success", props<{
  activities: PaginateDatasource<Activity>
}>())
export const loadActivitiesFailed = createAction("[Activities] Load Activities Failed", props<{
  error: HttpError
}>())

export const activityActiveChanges = createAction("[Activities] On Activity change prop", props<{
  changes: PartialActivity
}>());

export const getActivity = createAction("[Activities] Get Active Activity", props<{ id: string }>());
export const getActivitySuccess = createAction("[Activities] Get Active Activity Success", props<{
  current: Activity
}>());
export const getActivityFailed = createAction("[Activities] Get Active Activity Failed", props<{
  error: HttpError
}>());

export const addActivity = createAction("[Activities] Add Activity", props<{ activity: PartialActivity }>());
export const addActivitySuccess = createAction("[Activities] Add Activity Success", props<{
  activity: PartialActivity
}>());
export const addActivityFailed = createAction("[Activities] Add Activity Failed", props<{
  error: HttpError
}>());


export const editActivity = createAction("[Activities] Edit Activity")
export const editActivitySuccess = createAction("[Activities] Edit Activity Success", props<{
  activity: PartialActivity
}>())
export const editActivityFailed = createAction("[Activities] Edit Activity Failed", props<{
  error: HttpError
}>())

export const clearActivityActive = createAction("[Activities] Clear Active changes");


