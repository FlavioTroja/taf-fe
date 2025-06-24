import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { ActiveEntity } from "../../../../../global";
import { Activity } from "../../../../models/Activities";
import { HttpError } from "../../../../models/Notification";
import { PaginateDatasource } from "../../../../models/Table";
import { reducer as activeActivityReducer } from "./active.reducer";
import { reducer as activitiesReducer } from "./activities.reducer";

export interface ActivitiesManagementState {
  activities?: Partial<PaginateDatasource<Activity>>;
  active?: Partial<ActiveEntity<Activity>>;
  httpError?: Partial<HttpError>
}

export const reducers: ActionReducerMap<ActivitiesManagementState> = {
  activities: activitiesReducer,
  active: activeActivityReducer,
}

export const selectActivitiesManager = createFeatureSelector<ActivitiesManagementState>('activities-manager');
