import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { reducer as supplierReducer } from "./suppliers.reducer";
import { reducer as httpErrorReducer } from "./http-error.reducer";
import { reducer as activeReducer } from "./active.reducer";
import { HttpError } from "../../../../models/Notification";
import { Supplier } from "../../../../models/Supplier";
import { PaginateDatasource } from "../../../../models/Table";
import { ActiveEntity } from "../../../../../global";

export interface SupplierManagementState {
  suppliers?: Partial<PaginateDatasource<Supplier>>;
  active?: Partial<ActiveEntity<Supplier>>;
  httpError?: Partial<HttpError>;
}

export const reducers: ActionReducerMap<SupplierManagementState> = {
  suppliers: supplierReducer,
  active: activeReducer,
  httpError: httpErrorReducer
}

export const selectSuppliersManager = createFeatureSelector<SupplierManagementState>("supplier-manager");
