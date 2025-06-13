import { Action, createReducer, on } from "@ngrx/store";
import * as ProductsActions from "../actions/products.actions";
import { ProductFilter } from "../../../../models/Product";
import { Query } from "../../../../../global";


const initialState: Query<ProductFilter> = {
  query: {
    value: ""
  },
  options: {
    limit: 10,
    page: 1
  }
}

const productsReducer = createReducer(
  initialState,
  on(ProductsActions.editProductFilterSuccess, (state, { filters }) => ({
      query: filters.query || {},
      options: filters.options || {}
  })),
  on(ProductsActions.clearProductFilter, (state) => ({

  }))
);

export function reducer(state: Query<ProductFilter> | undefined, action: Action) {
  return productsReducer(state, action)
}
