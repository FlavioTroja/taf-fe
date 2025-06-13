import { CategoryFilter } from "../../../../models/Category";
import { Action, createReducer, on } from "@ngrx/store";
import * as CategoriesActions from "../actions/categories.actions";
import { Query } from "../../../../../global";


const initialState: Query<CategoryFilter>  = {
  query: {
    value: ""
  },
  options: {
    limit: 10,
    page: 1
  }
}

const categoriesReducer = createReducer(
  initialState,
  on(CategoriesActions.editCategoryFilterSuccess, (state, { filters }) => ({
      query: filters.query || {},
      options: filters.options || {}
  })),
  on(CategoriesActions.clearCategoryFilter, (state) => ({

  }))
);

export function reducer(state: Query<CategoryFilter> | undefined, action: Action) {
  return categoriesReducer(state, action)
}
