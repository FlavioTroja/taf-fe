import { createAction, props } from "@ngrx/store";
import { PartialCategory, Category } from "../../../../models/Category";
import { HttpError } from "../../../../models/Notification";
import { Query } from "../../../../../global";
import { PaginateDatasource } from "../../../../models/Table";
import { CategoryFilter } from "../../../../models/Category";

export const addCategory = createAction("[Categories] Add", props<{ category: PartialCategory }>());

export const addCategorySuccess = createAction("[Categories] Add category Success", props<{ category: Category }>());

export const addCategoryFailed = createAction("[Categories] Add Failed", props<{ error: HttpError }>());

export const getCategory = createAction("[Categories] Get", props<{ id: number }>());

export const getCategorySuccess = createAction("[Categories] Get category Success", props<{ current: Category }>());

export const getCategoryFailed = createAction("[Categories] Get Failed", props<{ error: HttpError }>());

export const categoryActiveChanges = createAction("[Categories] On category change prop", props<{ changes: PartialCategory }>());

export const clearCategoryActive = createAction("[Categories] Clear Active changes");

export const editCategory = createAction("[Categories] Edit");

export const editCategorySuccess = createAction("[Categories] Edit category Success", props<{ category: Category }>());

export const editCategoryFailed = createAction("[Categories] Edit Failed", props<{ error: HttpError }>());

export const deleteCategory = createAction("[Categories] Delete", props<{ id: number }>());

export const deleteCategorySuccess = createAction("[Categories] Delete category Success", props<{ category: Category }>());

export const deleteCategoryFailed = createAction("[Categories] Delete Failed", props<{ error: HttpError }>());

export const loadCategories = createAction("[Categories] Load");

export const loadCategoriesSuccess = createAction("[Categories] Load Success", props<{ categories: PaginateDatasource<Category> }>());

export const loadCategoriesFailed = createAction("[Categories] Load Failed", props<{ error: HttpError }>());

export const clearCategoryHttpError = createAction("[Categories] Clear Http Error");

export const deleteCategoryFromEdit = createAction("[Categories] Delete category from edit", props<{ id: number }>());

export const editCategoryFilter = createAction("[Categories] Edit category filter", props<{ filters: Query<CategoryFilter> }>());
export const editCategoryFilterSuccess = createAction("[Categories] Edit category filter success", props<{ filters: Query<CategoryFilter> }>());
export const clearCategoryFilter = createAction("[Categories] Edit category filter");
