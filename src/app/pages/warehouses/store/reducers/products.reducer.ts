import { Action, createReducer, on } from "@ngrx/store";
import * as WarehouseActions from "../actions/warehouses.actions";
import { Warehouse } from "../../../../models/Warehouse";

const initialState: Partial<Warehouse> = {};

const productsWarehouseReducer = createReducer(
  initialState,
  on(WarehouseActions.loadWarehouseProductsSuccess, (state, { warehouse }) => ({
      ...warehouse
  })),

);

export function reducer(state: Partial<Warehouse> | undefined, action: Action) {
  return productsWarehouseReducer(state, action)
}
