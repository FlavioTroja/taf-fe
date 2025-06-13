import { Action, createReducer, on } from "@ngrx/store";
import { CargoFilter } from "../../../../models/Cargo";
import { Query } from "../../../../../global";
import * as CargoActions from "../actions/cargos.actions";


const initialState: Query<CargoFilter> = {
  query: {
    value: ""
  },
  options: {
    limit: 10,
    page: 1
  }
}

const cargosReducer = createReducer(
  initialState,
  on(CargoActions.editCargoFilterSuccess, (state, { filters }) => ({
      query: filters.query || {},
      options: filters.options || {}
  })),
  on(CargoActions.clearCargoFilter, (state) => ({

  }))
);

export function reducer(state: Query<CargoFilter> | undefined, action: Action) {
  return cargosReducer(state, action)
}
