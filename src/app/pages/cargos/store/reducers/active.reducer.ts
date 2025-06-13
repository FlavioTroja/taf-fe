import { Action, createReducer, on } from "@ngrx/store";
import * as CargoActions from "../actions/cargos.actions";
import { Cargo } from "../../../../models/Cargo";
import { ActiveEntity } from "../../../../../global";
import * as ProductActions from "../../../products/store/actions/products.actions";

const initialState: Partial<ActiveEntity<Cargo>> = {};

const activeCargoReducer = createReducer(
  initialState,
  on(CargoActions.getCargoSuccess, (state, { current }) => ({
    current: { ...current }
  })),
  on(CargoActions.loadCargosSuccess, (state, {  }) => ({
    current: undefined
  })),
  on(CargoActions.createCargoSuccess, (state, { cargo }) => ({
    current: undefined
  })),
  on(CargoActions.clearCargoActive, (state) => ({
    changes: undefined,
    current: undefined
  })),
  // on(CargoActions.editCargoSuccess, (state, { cargo }) => ({
  //   current: { ...cargo }
  // })),
);

export function reducer(state: Partial<ActiveEntity<Cargo>> | undefined, action: Action) {
  return activeCargoReducer(state, action)
}
