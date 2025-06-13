import { Action, createReducer, on } from "@ngrx/store";
import * as WarehousesActions from "../actions/warehouses.actions";
import { Warehouse } from "../../../../models/Warehouse";
import { PaginateDatasource } from "../../../../models/Table";


const initialState: Partial<PaginateDatasource<Warehouse>> = {}

const usersReducer = createReducer(
  initialState,
  on(WarehousesActions.loadWarehousesSuccess, (state, { warehouses }) => ({
    ...warehouses
  }))
);

export function reducer(state: Partial<PaginateDatasource<Warehouse>> | undefined, action: Action) {
  return usersReducer(state, action)
}
