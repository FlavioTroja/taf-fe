import { Action, createReducer, on } from "@ngrx/store";
import * as CargoActions from "../actions/cargos.actions";
import { BatchCargo } from "../../../../models/Cargo";
import { ActiveEntity } from "../../../../../global";

const initialState: Partial<ActiveEntity<BatchCargo[]>> = {};

const activeBatchCargoReducer = createReducer(
    initialState,
    on(CargoActions.batchCargoSuccess, (state, {  }) => ({
        current: undefined,
        changes: undefined,
    })),
    on(CargoActions.clearBatchCargoActive, (state) => ({
        changes: undefined,
        current: undefined
    })),
    on(CargoActions.batchCargoActiveChanges, (state, { changes }) => ({
        ...state,
        changes: changes
    })),
    // on(CargoActions.editCargoSuccess, (state, { cargo }) => ({
    //   current: { ...cargo }
    // })),
);

export function reducer(state: Partial<ActiveEntity<BatchCargo[]>> | undefined, action: Action) {
    return activeBatchCargoReducer(state, action)
}
