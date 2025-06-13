import { Action, createReducer, on } from "@ngrx/store";
import { ActiveEntity } from "../../../../../global";
import * as TaskStepActions from "../actions/task-steps.actions";
import { TaskStep } from "../../../../models/TaskSteps";
import * as TaskStepsAction from "../actions/task-steps.actions";

const initialState: Partial<ActiveEntity<TaskStep>> = {};

const activeTaskStepReducer = createReducer(
  initialState,
  on(TaskStepActions.getTaskStepSuccess, (state, { current }) => ({
    current: { ...current }
  })),
  on(TaskStepActions.taskStepActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
  on(TaskStepActions.clearTaskStepChanges, (state) => ({
    ...state,
    changes: {}
  })),
  on(TaskStepActions.clearTaskStepActive, (_) => ({
    current: undefined,
    changes: {}
  })),
  on(
    TaskStepsAction.assignMeTaskStepSuccess,
    TaskStepsAction.completeTaskStepSuccess,
    (state, { taskStep }) => ({
      ...state,
      current: { ...(state.current) } as TaskStep
    })
  ),
);

export function reducer(state: Partial<ActiveEntity<TaskStep>> | undefined, action: Action) {
  return activeTaskStepReducer(state, action)
}
