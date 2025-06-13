import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { reducer as taskStepsReducer } from "./task-steps.reducer";
import { reducer as httpErrorReducer } from "./http-error.reducer";
import { reducer as taskStepsFiltersReducer } from "./task-steps-filters";
import { reducer as activeTaskStepReducer } from "./activeTaskStep.reducer";
import { reducer as taskStepCompletionFormReducer } from "./taskStepCompletionForm.reducer";
import { HttpError } from "../../../../models/Notification";
import { PaginateDatasource } from "../../../../models/Table";
import { ActiveEntity, Query } from "../../../../../global";
import { TaskStep, TaskStepFilter, TaskStepFormOnCompletion } from "../../../../models/TaskSteps";

export interface TaskStepManagementState {
  taskSteps?: Partial<PaginateDatasource<TaskStep>>;
  filters?: Query<TaskStepFilter>;
  httpError?: Partial<HttpError>;
  activeTaskStep?: Partial<ActiveEntity<TaskStep>>;
  taskStepCompletionForm?: Partial<ActiveEntity<TaskStepFormOnCompletion>>
}

export const reducers: ActionReducerMap<TaskStepManagementState> = {
  taskSteps: taskStepsReducer,
  filters: taskStepsFiltersReducer,
  httpError: httpErrorReducer,
  activeTaskStep: activeTaskStepReducer,
  taskStepCompletionForm: taskStepCompletionFormReducer,
}

export const selectTaskStepsManager = createFeatureSelector<TaskStepManagementState>("task-step-manager");
