import { Action, createReducer, on } from "@ngrx/store";
import * as TaskStepsActions from "../actions/task-steps.actions";
import { PaginateDatasource } from "../../../../models/Table";
import { TaskStep } from "../../../../models/TaskSteps";


const initialState: Partial<PaginateDatasource<TaskStep>> = {}

const taskStepsReducer = createReducer(
  initialState,
  on(TaskStepsActions.loadTaskStepsSuccess, (state, { taskSteps }) => ({
    ...taskSteps
  }))
);

export function reducer(state: Partial<PaginateDatasource<TaskStep>> | undefined, action: Action) {
  return taskStepsReducer(state, action)
}
