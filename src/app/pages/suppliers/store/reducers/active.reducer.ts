import { Action, createReducer, on } from "@ngrx/store";
import * as SupplierActions from "../actions/suppliers.actions";
import { Supplier } from "../../../../models/Supplier";
import { ActiveEntity } from "../../../../../global";

const initialState: Partial<ActiveEntity<Supplier>> = {};

const activeSupplierReducer = createReducer(
  initialState,
  on(SupplierActions.getSupplierSuccess, (state, { current }) => ({
    current: current
  })),
  on(SupplierActions.supplierActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
  on(SupplierActions.editSupplierSuccess, (state, { supplier }) => ({
    current: { ...supplier }
  })),
  on(SupplierActions.clearSupplierActive, (state) => ({
    changes: undefined,
    current: undefined
  })),
  on(SupplierActions.loadSuppliersSuccess, (state) => ({
    changes: undefined,
    current: undefined
  })),
);

export function reducer(state: Partial<ActiveEntity<Supplier>> | undefined, action: Action) {
  return activeSupplierReducer(state, action)
}
