import { createAction, props } from "@ngrx/store";
import { BuyingPrice, PartialProduct, Product, ProductFilter } from "../../../../models/Product";
import { HttpError } from "../../../../models/Notification";
import { DefaultQueryParams, Query } from "../../../../../global";
import { PaginateDatasource } from "../../../../models/Table";

export const addProduct = createAction("[Products] Add", props<{ product: PartialProduct }>());
export const addProductSuccess = createAction("[Products] Add product Success", props<{ product: Product }>());
export const addProductFailed = createAction("[Products] Add Failed", props<{ error: HttpError }>());

export const getProduct = createAction("[Products] Get", props<{ id: number, params?: DefaultQueryParams }>());
export const getProductSuccess = createAction("[Products] Get product Success", props<{ current: Product }>());
export const getProductFailed = createAction("[Products] Get Failed", props<{ error: HttpError }>());

export const productActiveChanges = createAction("[Products] On product change prop", props<{ changes: PartialProduct }>());

export const clearProductActive = createAction("[Products] Clear Active changes");

export const editProduct = createAction("[Products] Edit");
export const editProductSuccess = createAction("[Products] Edit product Success", props<{ product: Product }>());
export const editProductFailed = createAction("[Products] Edit Failed", props<{ error: HttpError }>());

export const deleteProduct = createAction("[Products] Delete", props<{ id: number }>());
export const deleteProductSuccess = createAction("[Products] Delete product Success", props<{ product: Product }>());
export const deleteProductFailed = createAction("[Products] Delete Failed", props<{ error: HttpError }>());

export const loadProducts = createAction("[Products] Load");
export const loadProductsSuccess = createAction("[Products] Load Success", props<{ products: PaginateDatasource<Product> }>());
export const loadProductsFailed = createAction("[Products] Load Failed", props<{ error: HttpError }>());

export const clearProductHttpError = createAction("[Products] Clear Http Error");

export const changeBuyingPriceProduct = createAction("[Products] Changing buying price", props<{ productOpts: { id: number, populate?: string }, changes: Partial<BuyingPrice> }>());
export const changeBuyingPriceProductSuccess = createAction("[Products] Buying price changed successfully");
export const changeBuyingPriceProductFailed = createAction("[Products] Failed changing buying price", props<{ error: HttpError }>());

export const editProductFilter = createAction("[Products] Edit product filter", props<{ filters: Query<ProductFilter> }>());
export const editProductFilterSuccess = createAction("[Products] Edit product filter success", props<{ filters: Query<ProductFilter> }>());
export const clearProductFilter = createAction("[Products] Edit product filter");

export const deleteProductFromView = createAction("[Products] Delete product from view", props<{ id: number }>());

export const copyProduct = createAction( "[Products] Copy product", props<{ id: number }>());
