import { createAction, props } from "@ngrx/store";
import { PaginateDatasource } from "../../../../models/Table";
import { HttpError } from "../../../../models/Notification";
import { DefaultQueryParams, Query } from "../../../../../global";
import { PartialTaskStep, TaskStep, TaskStepFilter, TaskStepFormOnCompletion } from "../../../../models/TaskSteps";

export const loadTaskSteps = createAction("[TaskSteps] Load", props<{ filters: Query<TaskStepFilter> }>());
export const loadTaskStepsSuccess = createAction("[TaskSteps] Load Success", props<{ taskSteps: PaginateDatasource<TaskStep> }>());
export const loadTaskStepsFailed = createAction("[TaskSteps] Load Failed", props<{ error: HttpError }>());

export const clearProductHttpError = createAction("[TaskSteps] Clear Http Error");

export const editTaskStepsFilter = createAction("[TaskSteps] Edit task steps filter", props<{ filters: Query<TaskStepFilter> }>());
export const editTaskStepsFilterSuccess = createAction("[TaskSteps] Edit task steps filter success", props<{ filters: Query<TaskStepFilter> }>());
export const clearTaskStepsFilter = createAction("[TaskSteps] Edit task steps filter");

export const assignMeTaskStep = createAction("[TaskSteps] Assign task step to me", props<{ id: number }>());
export const assignMeTaskStepSuccess = createAction("[TaskSteps] Assign task step to me success", props<{ taskStep: TaskStep }>());
export const assignMeTaskStepFailed = createAction("[TaskSteps] Assign task step to me failed", props<{ error: HttpError }>());

export const completeTaskStep = createAction("[TaskSteps] Complete task step", props<{ taskStepForm: TaskStepFormOnCompletion }>());
export const completeTaskStepSuccess = createAction("[TaskSteps] Complete task step success", props<{ taskStep: TaskStep }>());
export const completeTaskStepFailed = createAction("[TaskSteps] Complete task step failed", props<{ error: HttpError }>());

export const getTaskStep = createAction("[TaskSteps] Get taskStep", props<{ id: number, params?: DefaultQueryParams }>());
export const getTaskStepSuccess = createAction("[TaskSteps] Get taskStep Success", props<{ current: TaskStep }>());
export const getTaskStepFailed = createAction("[TaskSteps] Get taskStep Failed", props<{ error: HttpError }>());

export const taskStepActiveChanges = createAction("[TaskSteps] On taskStep change prop", props<{ changes: PartialTaskStep }>());

export const clearTaskStepChanges = createAction("[TaskSteps] Clear taskStep changes");

export const clearTaskStepActive = createAction("[TaskSteps] Clear taskStep active");

export const taskStepCompletionFormActiveChanges = createAction("[TaskSteps] On taskStep completion form change prop", props<{ changes: TaskStepFormOnCompletion }>());

export const clearTaskStepCompletionActiveChanges = createAction("[TaskSteps] Clear taskStep completion form");
