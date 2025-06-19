import { Action, createReducer, on } from "@ngrx/store";
import { Municipal } from "../../../../models/Municipals";
import { PaginateDatasource } from "../../../../models/Table";
import * as MunicipalsActions from "../actions/municipals.actions";


const initialState: Partial<PaginateDatasource<Municipal>> = {};

const municipalsReducer = createReducer(
  initialState,
  on(MunicipalsActions.loadMunicipalsSuccess, (state, { municipals }) => ({
    ...municipals
  })),
)

export function reducer(state: Partial<PaginateDatasource<Municipal>> | undefined, action: Action) {
  return municipalsReducer(state, action)
}
