import { Action, createReducer, on } from "@ngrx/store";
import * as CategoryActions from "../actions/categories.actions";
import { Category } from "../../../../models/Category";
import { ActiveEntity } from "../../../../../global";

const initialState: Partial<ActiveEntity<Category>> = {};

const activeCategoryReducer = createReducer(
  initialState,
  on(CategoryActions.getCategorySuccess, (state, { current }) => ({
    current: { ...current }
  })),
  on(CategoryActions.categoryActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
  on(CategoryActions.editCategorySuccess, (state, { category }) => ({
    current: { ...category }
  })),
  on(CategoryActions.clearCategoryActive, (state) => ({
    changes: undefined,
    current: undefined
  })),
  on(CategoryActions.loadCategoriesSuccess, (state) => ({
    changes: undefined,
    current: undefined
  })),
);

export function reducer(state: Partial<ActiveEntity<Category>> | undefined, action: Action) {
  return activeCategoryReducer(state, action)
}
