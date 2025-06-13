import { Action, createReducer, on } from "@ngrx/store";
import * as ResourceActions from "../actions/resources.actions";
import { Query } from "../../../../../global";
import {ResourceFilter} from "../../../../models/Resource";


const initialState: Query<ResourceFilter> = {
  query: {
    value: ""
  },
  options: {
    limit: 10,
    page: 1
  }
}

const resourcesReducer = createReducer(
  initialState,
  on(ResourceActions.editResourceFilterSuccess, (state, { filters }) => ({
    query: filters.query || {},
    options: filters.options || {}
  })),
  on(ResourceActions.clearResourceFilter, (state) => ({

  }))
);

export function reducer(state: Query<ResourceFilter> | undefined, action: Action) {
  return resourcesReducer(state, action)
}
