import { createAction, props } from "@ngrx/store";
import { PartialSupplier, Supplier } from "../../../../models/Supplier";
import { HttpError } from "../../../../models/Notification";
import { DefaultQueryParams, Query } from "../../../../../global";
import { PaginateDatasource } from "../../../../models/Table";

export const addSupplier = createAction("[Suppliers] Add", props<{ supplier: PartialSupplier }>());

export const addSupplierSuccess = createAction("[Suppliers] Add supplier Success", props<{ supplier: Supplier }>());

export const addSupplierFailed = createAction("[Suppliers] Add Failed", props<{ error: HttpError }>());

export const getSupplier = createAction("[Suppliers] Get", props<{ id: number, params?: DefaultQueryParams }>());

export const getSupplierSuccess = createAction("[Suppliers] Get supplier Success", props<{ current: Supplier }>());

export const getSupplierFailed = createAction("[Suppliers] Get Failed", props<{ error: HttpError }>());

export const supplierActiveChanges = createAction("[Suppliers] On supplier change prop", props<{ changes: PartialSupplier }>());

export const clearSupplierActive = createAction("[Suppliers] Clear Active changes");

export const editSupplier = createAction("[Suppliers] Edit");

export const editSupplierSuccess = createAction("[Suppliers] Edit supplier Success", props<{ supplier: Supplier }>());

export const editSupplierFailed = createAction("[Suppliers] Edit Failed", props<{ error: HttpError }>());

export const deleteSupplier = createAction("[Suppliers] Delete", props<{ id: number }>());

export const deleteSupplierSuccess = createAction("[Suppliers] Delete supplier Success", props<{ supplier: Supplier }>());

export const deleteSupplierFailed = createAction("[Suppliers] Delete Failed", props<{ error: HttpError }>());

export const loadSuppliers = createAction("[Suppliers] Load", props<{ query: Query<object> }>());

export const loadSuppliersSuccess = createAction("[Suppliers] Load Success", props<{ suppliers: PaginateDatasource<Supplier> }>());

export const loadSuppliersFailed = createAction("[Suppliers] Load Failed", props<{ error: HttpError }>());

export const clearSupplierHttpError = createAction("[Suppliers] Clear Http Error");
