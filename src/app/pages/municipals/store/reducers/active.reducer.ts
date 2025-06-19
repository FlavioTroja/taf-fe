import { Action, createReducer, on } from "@ngrx/store";
import { ActiveEntity } from "../../../../../global";
import { Municipal } from "../../../../models/Municipals";
import * as MunicipalsActions from "../actions/municipals.actions";


const initialState: Partial<ActiveEntity<Municipal>> = {}

const activeMunicipalityReducer = createReducer(
  initialState,
  on(MunicipalsActions.getMunicipalSuccess, (state, { current }) => ({
    current,
  })),
  on(MunicipalsActions.municipalActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
)

export function reducer(state: Partial<ActiveEntity<Municipal>> | undefined, action: Action) {
  return activeMunicipalityReducer(state, action)
}
