import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { reducer as productReducer } from "./products.reducer";
import { reducer as httpErrorReducer } from "./http-error.reducer";
import { reducer as activeReducer } from "./active.reducer";
import { reducer as filtersReducer } from "./filters.reducer";
import { HttpError } from "../../../../models/Notification";
import { Product, ProductFilter } from "../../../../models/Product";
import { PaginateDatasource } from "../../../../models/Table";
import { ActiveEntity, Query } from "../../../../../global";

export interface ProductManagementState {
  products?: Partial<PaginateDatasource<Product>>;
  filters?: Query<ProductFilter>;
  active?: Partial<ActiveEntity<Product>>;
  httpError?: Partial<HttpError>;
}

export const reducers: ActionReducerMap<ProductManagementState> = {
  products: productReducer,
  filters: filtersReducer,
  active: activeReducer,
  httpError: httpErrorReducer
}

export const selectProductsManager = createFeatureSelector<ProductManagementState>("product-manager");
