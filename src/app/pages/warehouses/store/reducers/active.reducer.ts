import { Action, createReducer, on } from "@ngrx/store";
import * as WarehouseActions from "../actions/warehouses.actions";
import { Warehouse } from "../../../../models/Warehouse";
import { ActiveEntity } from "../../../../../global";

const initialState: Partial<ActiveEntity<Warehouse>> = {};

const activeWarehouseReducer = createReducer(
  initialState,
  on(WarehouseActions.getWarehouseSuccess, (state, { current }) => ({
    current: { ...current }
  })),
  on(WarehouseActions.warehouseActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
  on(WarehouseActions.editWarehouseSuccess, (state, { warehouse }) => ({
    current: { ...warehouse }
  })),
  on(WarehouseActions.clearWarehouseActive, (state) => ({
    changes: undefined,
    current: undefined
  })),

);

export function reducer(state: Partial<ActiveEntity<Warehouse>> | undefined, action: Action) {
  return activeWarehouseReducer(state, action)
}
