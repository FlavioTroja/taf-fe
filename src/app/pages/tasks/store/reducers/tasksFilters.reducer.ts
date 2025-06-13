import { Query } from "../../../../../global";
import { Action, createReducer, on } from "@ngrx/store";
import * as TasksActions from "../actions/tasks.actions";
import { TaskFilter } from "../../../../models/Task";

const initialState: Query<TaskFilter> = {
  query: { },
  options: {
    limit: 10,
    page: 1
  }
}

const taskFiltersReducer = createReducer(
  initialState,
  on(TasksActions.editTasksFilterSuccess, (state, { filters }) => ({
    query: filters.query || {},
    options: filters.options || {}
  })),
  on(TasksActions.clearTasksFilter, (state) => ( {} ))
);

export function reducer(state: Query<TaskFilter> | undefined, action: Action) {
  return taskFiltersReducer(state, action)
}
