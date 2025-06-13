import { createSelector } from "@ngrx/store";
import { selectCategoriesManager, CategoryManagementState } from "../reducers";

export const getCategoriesPaginate = createSelector(
  selectCategoriesManager,
  (state?: CategoryManagementState) => state?.categories
)

export const getCurrentCategory = createSelector(
  selectCategoriesManager,
  (state?: CategoryManagementState) => state?.active?.current
)

export const getActiveCategoryChanges = createSelector(
  selectCategoriesManager,
  (state?: CategoryManagementState) => state?.active?.changes ?? {}
)

export const getCategoriesHttpError = createSelector(
  selectCategoriesManager,
  (state?: CategoryManagementState) => state?.httpError
)

export const getContentOfCategoryDeleteModel = createSelector(
  selectCategoriesManager,
  (state?: CategoryManagementState) => `
  Si sta eliminando la categoria <b>${state?.active?.current?.name}</b>.
  <br>
  Questa operazione non è reversibile.
  `
);

export const getCategoryFilter = createSelector(
  selectCategoriesManager,
  (state?: CategoryManagementState) => state?.filters
);

export const disabledCategoryDeleteFromView = createSelector(
  selectCategoriesManager,
  (state?: CategoryManagementState) => !!state?.active?.current?.children?.length
);
