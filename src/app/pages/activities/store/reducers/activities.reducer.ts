import { Action, createReducer, on } from "@ngrx/store";
import { Activity } from "../../../../models/Activities";
import { PaginateDatasource } from "../../../../models/Table";
import * as ActivitiesActions from "../actions/activities.actions";


const initialState: Partial<PaginateDatasource<Activity>> = {};

const activitiesReducer = createReducer(
  initialState,
  on(ActivitiesActions.loadActivitiesSuccess, (state, { activities }) => ({
    ...activities
  })),
)

export function reducer(state: Partial<PaginateDatasource<Activity>> | undefined, action: Action) {
  return activitiesReducer(state, action)
}
