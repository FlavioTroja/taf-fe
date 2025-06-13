import { ActiveEntity } from "../../../../../global";
import { Action, createReducer, on } from "@ngrx/store";
import * as TaskStepsActions from "../actions/task-steps.actions"
import { TaskStepFormOnCompletion } from "../../../../models/TaskSteps";

const initialState: Partial<ActiveEntity<TaskStepFormOnCompletion>> = {};

const taskStepCompletionFormReducer = createReducer(
  initialState,
  on(TaskStepsActions.taskStepCompletionFormActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
  on(TaskStepsActions.clearTaskStepCompletionActiveChanges, (state) => ({
    ...state,
    changes: {}
  })),

);

export function reducer(state: Partial<ActiveEntity<TaskStepFormOnCompletion>> | undefined, action: Action) {
  return taskStepCompletionFormReducer(state, action)
}
