import { Action, createReducer, on } from "@ngrx/store";
import * as TaskStepsActions from "../actions/task-steps.actions";
import { Query } from "../../../../../global";
import { TaskStepFilter } from "../../../../models/TaskSteps";

const initialState: Query<TaskStepFilter> = {
  query: { },
  options: {
    limit: 10,
    page: 1
  }
}

const taskStepsFiltersReducer = createReducer(
  initialState,
  on(TaskStepsActions.editTaskStepsFilterSuccess, (state, { filters }) => ({
    query: filters.query || {},
    options: filters.options || {}
  })),
  on(TaskStepsActions.clearTaskStepsFilter, (state) => ( {} ))
);

export function reducer(state: Query<TaskStepFilter> | undefined, action: Action) {
  return taskStepsFiltersReducer(state, action)
}
