import { createAction, props } from "@ngrx/store";
import { PartialWarehouse, Warehouse } from "../../../../models/Warehouse";
import { HttpError } from "../../../../models/Notification";
import { Query } from "../../../../../global";
import { PaginateDatasource } from "../../../../models/Table";

export const addWarehouse = createAction("[Warehouses] Add", props<{ warehouse: Warehouse }>());

export const addWarehouseSuccess = createAction("[Warehouses] Add warehouse Success", props<{ warehouse: Warehouse }>());

export const addWarehouseFailed = createAction("[Warehouses] Add Failed", props<{ error: HttpError }>());

export const getWarehouse = createAction("[Warehouses] Get", props<{ id: number }>());

export const getWarehouseSuccess = createAction("[Warehouses] Get warehouse Success", props<{ current: Warehouse }>());

export const getWarehouseFailed = createAction("[Warehouses] Get Failed", props<{ error: HttpError }>());

export const warehouseActiveChanges = createAction("[Warehouses] On warehouse change prop", props<{ changes: PartialWarehouse }>());

export const clearWarehouseActive = createAction("[Warehouses] Clear Active changes");

export const editWarehouse = createAction("[Warehouses] Edit");

export const editWarehouseSuccess = createAction("[Warehouses] Edit warehouse Success", props<{ warehouse: Warehouse }>());

export const editWarehouseFailed = createAction("[Warehouses] Edit Failed", props<{ error: HttpError }>());

export const deleteWarehouse = createAction("[Warehouses] Delete", props<{ id: number }>());

export const deleteWarehouseSuccess = createAction("[Warehouses] Delete warehouse Success", props<{ warehouse: Warehouse }>());

export const deleteWarehouseFailed = createAction("[Warehouses] Delete Failed", props<{ error: HttpError }>());

export const loadWarehouses = createAction("[Warehouses] Load", props<{ query: Query<object> }>());

export const loadWarehousesSuccess = createAction("[Warehouses] Load Success", props<{ warehouses: PaginateDatasource<Warehouse> }>());

export const loadWarehousesFailed = createAction("[Warehouses] Load Failed", props<{ error: HttpError }>());

export const clearWarehouseHttpError = createAction("[Warehouses] Clear Http Error");

export const loadWarehouseProducts = createAction("[WarehouseProducts] Load", props<{ id: number, query: Query<object> }>());

export const loadWarehouseProductsSuccess = createAction("[WarehouseProducts] Load Success", props<{ warehouse: Warehouse }>());

export const loadWarehouseProductsFailed = createAction("[WarehouseProducts] Load Failed", props<{ error: HttpError }>());
