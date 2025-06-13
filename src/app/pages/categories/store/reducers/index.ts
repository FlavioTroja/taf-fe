import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { reducer as categoryReducer } from "./categories.reducer";
import { reducer as httpErrorReducer } from "./http-error.reducer";
import { reducer as activeReducer } from "./active.reducer";
import { reducer as filterReducer } from "./filters.reducer";
import { HttpError } from "../../../../models/Notification";
import { Category, CategoryFilter } from "../../../../models/Category";
import { PaginateDatasource } from "../../../../models/Table";
import { ActiveEntity, Query } from "../../../../../global";

export interface CategoryManagementState {
  categories?: Partial<PaginateDatasource<Category>>;
  filters?: Query<CategoryFilter>;
  active?: Partial<ActiveEntity<Category>>;
  httpError?: Partial<HttpError>;
}

export const reducers: ActionReducerMap<CategoryManagementState> = {
  categories: categoryReducer,
  active: activeReducer,
  httpError: httpErrorReducer,
  filters: filterReducer
}

export const selectCategoriesManager = createFeatureSelector<CategoryManagementState>("category-manager");
