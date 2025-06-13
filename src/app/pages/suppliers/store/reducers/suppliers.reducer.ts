import { Action, createReducer, on } from "@ngrx/store";
import * as SuppliersActions from "../actions/suppliers.actions";
import { Supplier } from "../../../../models/Supplier";
import { PaginateDatasource } from "../../../../models/Table";


const initialState: Partial<PaginateDatasource<Supplier>> = {}

const suppliersReducer = createReducer(
  initialState,
  on(SuppliersActions.loadSuppliersSuccess, (state, { suppliers }) => ({
    ...suppliers
  }))
);

export function reducer(state: Partial<PaginateDatasource<Supplier>> | undefined, action: Action) {
  return suppliersReducer(state, action)
}
