import { Action, createReducer, on } from "@ngrx/store";
import * as ProductsActions from "../actions/products.actions";
import { Product } from "../../../../models/Product";
import { PaginateDatasource } from "../../../../models/Table";


const initialState: Partial<PaginateDatasource<Product>> = {}

const productsReducer = createReducer(
  initialState,
  on(ProductsActions.loadProductsSuccess, (state, { products }) => ({
    ...products
  }))
);

export function reducer(state: Partial<PaginateDatasource<Product>> | undefined, action: Action) {
  return productsReducer(state, action)
}
