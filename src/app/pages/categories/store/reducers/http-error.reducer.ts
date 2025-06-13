import { Action, createReducer, on } from "@ngrx/store";
import * as CategoryActions from "../actions/categories.actions";
import { HttpError } from "../../../../models/Notification";

const initialState: Partial<HttpError> = {};

const httpErrorReducer = createReducer(
  initialState,
  on(CategoryActions.clearCategoryHttpError, (state, { }) => ({})),

  on(CategoryActions.loadCategoriesFailed, (state, { error }) => ({
    ...error
  })),
  on(CategoryActions.getCategoryFailed, (state, { error }) => ({
    ...error
  })),
  on(CategoryActions.editCategoryFailed, (state, { error }) => ({
    ...error
  })),
  on(CategoryActions.deleteCategoryFailed, (state, { error }) => ({
    ...error
  }))
);

export function reducer(state: Partial<HttpError> | undefined, action: Action) {
  return httpErrorReducer(state, action)
}
