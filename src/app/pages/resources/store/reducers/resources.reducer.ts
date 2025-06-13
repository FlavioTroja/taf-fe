import { Action, createReducer, on } from "@ngrx/store";
import * as ReducerActions from "../actions/resources.actions"
import { PaginateDatasource } from "../../../../models/Table";
import {Resource} from "../../../../models/Resource";


const initialState: Partial<PaginateDatasource<Resource>> = {}

const resourceReducer = createReducer(
  initialState,
  on(ReducerActions.loadResourcesSuccess, (state, { resources }) => ({
    ...resources
  }))
);

export function reducer(state: Partial<PaginateDatasource<Resource>> | undefined, action: Action) {
  return resourceReducer(state, action)
}
