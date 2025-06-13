import { createSelector } from "@ngrx/store";
import { selectProductsManager, ProductManagementState } from "../reducers";

export const getProductsPaginate = createSelector(
  selectProductsManager,
  (state?: ProductManagementState) => state?.products
)

export const getCurrentProduct = createSelector(
  selectProductsManager,
  (state?: ProductManagementState) => state?.active?.current
)

export const getActiveProductChanges = createSelector(
  selectProductsManager,
  (state?: ProductManagementState) => state?.active?.changes ?? {}
)

export const getProductsHttpError = createSelector(
  selectProductsManager,
  (state?: ProductManagementState) => state?.httpError
)

export const getProductFilter = createSelector(
  selectProductsManager,
  (state?: ProductManagementState) => state?.filters
);

export const getContentOfProductDeleteModel = createSelector(
  selectProductsManager,
  (state?: ProductManagementState) => `
  Si sta eliminando il prodotto ${state?.active?.current?.name}.
  <br>
  Questa operazione non è reversibile.
  `
);
