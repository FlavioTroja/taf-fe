import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { ActiveEntity } from "../../../../../global";
import { Municipal } from "../../../../models/Municipals";
import { HttpError } from "../../../../models/Notification";
import { PaginateDatasource } from "../../../../models/Table";
import { reducer as activeMunicipalReducer } from "./active.reducer";
import { reducer as municipalsReducer } from "./municipals.reducer";

export interface MunicipalsManagementState {
  municipals?: Partial<PaginateDatasource<Municipal>>;
  active?: Partial<ActiveEntity<Municipal>>;
  httpError?: Partial<HttpError>
}

export const reducers: ActionReducerMap<MunicipalsManagementState> = {
  municipals: municipalsReducer,
  active: activeMunicipalReducer,
}

export const selectMunicipalsManager = createFeatureSelector<MunicipalsManagementState>('municipals-manager');
