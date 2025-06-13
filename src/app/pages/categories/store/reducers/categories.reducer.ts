import { Action, createReducer, on } from "@ngrx/store";
import * as CategoriesActions from "../actions/categories.actions";
import { Category } from "../../../../models/Category";
import { PaginateDatasource } from "../../../../models/Table";


const initialState: Partial<PaginateDatasource<Category>> = {}

const categoriesReducer = createReducer(
  initialState,
  on(CategoriesActions.loadCategoriesSuccess, (state, { categories }) => ({
    ...categories
  }))
);

export function reducer(state: Partial<PaginateDatasource<Category>> | undefined, action: Action) {
  return categoriesReducer(state, action)
}
