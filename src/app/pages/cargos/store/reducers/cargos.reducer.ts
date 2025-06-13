import { Action, createReducer, on } from "@ngrx/store";
import * as CargosActions from "../actions/cargos.actions";
import { Cargo } from "../../../../models/Cargo";
import { PaginateDatasource } from "../../../../models/Table";


const initialState: Partial<PaginateDatasource<Cargo>> = {}

const cargosReducer = createReducer(
  initialState,
  on(CargosActions.loadCargosSuccess, (state, { cargos }) => ({
    ...cargos
  }))
);

export function reducer(state: Partial<PaginateDatasource<Cargo>> | undefined, action: Action) {
  return cargosReducer(state, action)
}
