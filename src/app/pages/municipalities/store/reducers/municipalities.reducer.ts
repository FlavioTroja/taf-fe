import { Action, createReducer, on } from "@ngrx/store";
import { Municipality } from "../../../../models/Municipalities";
import { PaginateDatasource } from "../../../../models/Table";
import * as MunicipalitiesActions from "../actions/municipalities.actions";


const initialState: Partial<PaginateDatasource<Municipality>> = {};

const municipalitiesReducer = createReducer(
  initialState,
  on(MunicipalitiesActions.loadMunicipalitiesSuccess, (state, { municipalities }) => ({
    ...municipalities
  }))
)

export function reducer(state: Partial<PaginateDatasource<Municipality>> | undefined, action: Action) {
  return municipalitiesReducer(state, action)
}
