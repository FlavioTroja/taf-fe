import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { reducer as cargoReducer } from "./cargos.reducer";
import { reducer as httpErrorReducer } from "./http-error.reducer";
import { reducer as activeReducer } from "./active.reducer";
import { reducer as activeBatchReducer } from "./activeBatch.reducer";
import { reducer as filtersReducer } from "./filters.reducer";
import { reducer as bulkReducer } from "./bulk.reducer";

import { HttpError } from "../../../../models/Notification";
import { BatchCargo, Cargo, CargoBulk, CargoFilter } from "../../../../models/Cargo";
import { PaginateDatasource } from "../../../../models/Table";
import { ActiveEntity, Query } from "../../../../../global";

export interface CargoManagementState {
  cargos?: Partial<PaginateDatasource<Cargo>>;
  filters: Partial<Query<CargoFilter>>;
  activeBatch?: Partial<ActiveEntity<BatchCargo[]>>;
  bulk?: Partial<CargoBulk>;
  active?: Partial<ActiveEntity<Cargo>>;
  httpError?: Partial<HttpError>;
}

export const reducers: ActionReducerMap<CargoManagementState> = {
  cargos: cargoReducer,
  filters: filtersReducer,
  activeBatch: activeBatchReducer,
  active: activeReducer,
  bulk: bulkReducer,
  httpError: httpErrorReducer
}

export const selectCargosManager = createFeatureSelector<CargoManagementState>("cargo-manager");
