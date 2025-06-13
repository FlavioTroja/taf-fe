import { PaginateDatasource } from "../../../../models/Table";
import { Action, createReducer, on } from "@ngrx/store";
import * as TasksActions from "../actions/tasks.actions";
import { Task } from "../../../../models/Task";

const initialState: Partial<PaginateDatasource<Task>> = {}

const tasksReducer = createReducer(
  initialState,
  on(TasksActions.loadTasksSuccess, (state, { tasks }) => ({
    ...tasks
  }))
);

export function reducer(state: Partial<PaginateDatasource<Task>> | undefined, action: Action) {
  return tasksReducer(state, action)
}
