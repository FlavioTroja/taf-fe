import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { reducer as warehouseReducer } from "./warehouses.reducer";
import { reducer as httpErrorReducer } from "./http-error.reducer";
import { reducer as activeReducer } from "./active.reducer";
import { reducer as productsReducer } from "./products.reducer";
import { HttpError } from "../../../../models/Notification";
import { Warehouse } from "../../../../models/Warehouse";
import { PaginateDatasource } from "../../../../models/Table";
import { ActiveEntity } from "../../../../../global";

export interface WarehouseManagementState {
  warehouses?: Partial<PaginateDatasource<Warehouse>>;
  active?: Partial<ActiveEntity<Warehouse>>;
  products?: Partial<Warehouse>
  httpError?: Partial<HttpError>;
}

export const reducers: ActionReducerMap<WarehouseManagementState> = {
  warehouses: warehouseReducer,
  active: activeReducer,
  products: productsReducer,
  httpError: httpErrorReducer
}

export const selectWarehousesManager = createFeatureSelector<WarehouseManagementState>("warehouse-manager");
