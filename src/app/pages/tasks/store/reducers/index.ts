import { PaginateDatasource } from "../../../../models/Table";
import { Query } from "../../../../../global";
import { HttpError } from "../../../../models/Notification";
import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { reducer as tasksReducer } from "./tasks.reducer";
import { reducer as tasksFiltersReducer } from "./tasksFilters.reducer";
import { reducer as httpErrorReducer } from "./httpError.reducer";
import { Task, TaskFilter } from "../../../../models/Task";

export interface TasksManagementState {
  tasks?: Partial<PaginateDatasource<Task>>;
  filters?: Query<TaskFilter>;
  httpError?: Partial<HttpError>;
  // activeTaskStep?: Partial<ActiveEntity<TaskStep>>;
}

export const reducers: ActionReducerMap<TasksManagementState> = {
  tasks: tasksReducer,
  filters: tasksFiltersReducer,
  httpError: httpErrorReducer,
  // activeTaskStep: activeTaskStepReducer,
  // taskStepCompletionForm: taskStepCompletionFormReducer,
}

export const selectTasksManager = createFeatureSelector<TasksManagementState>("task-manager");
