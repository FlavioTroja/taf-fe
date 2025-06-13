import { createAction, props } from "@ngrx/store";
import { Query } from "../../../../../global";
import { Task, TaskFilter } from "../../../../models/Task";
import { PaginateDatasource } from "../../../../models/Table";
import { HttpError } from "../../../../models/Notification";

export const loadTasks = createAction("[Tasks] Load", props<{ filters: Query<TaskFilter> }>());
export const loadTasksSuccess = createAction("[Tasks] Load Success", props<{ tasks: PaginateDatasource<Task> }>());
export const loadTasksFailed = createAction("[Tasks] Load Failed", props<{ error: HttpError }>());


export const editTasksFilter = createAction("[Tasks] Edit tasks filter", props<{ filters: Query<TaskFilter> }>());
export const editTasksFilterSuccess = createAction("[Tasks] Edit tasks filter success", props<{ filters: Query<TaskFilter> }>());
export const clearTasksFilter = createAction("[Tasks] Edit tasks filter");
