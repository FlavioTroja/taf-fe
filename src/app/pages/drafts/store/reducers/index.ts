import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { reducer as httpErrorReducer } from "./httpError.reducer";
import { reducer as setupReducer } from "./setups.reducer";
import { reducer as activeSetupReducer } from "./activeSetup.reducer";
import { reducer as setupFiltersReducer } from "./setupFilters.reducer";
import { reducer as activeCostReducer } from "./activeCost.reducer";
import { HttpError } from "../../../../models/Notification";
import { ActiveEntity, Query } from "../../../../../global";
import { Cost, Setup, SetupFilter } from "../../../../models/Setup";
import { PaginateDatasource } from "../../../../models/Table";

export interface DraftManagementState {
  setups?: Partial<PaginateDatasource<Setup>>;
  activeSetup?: Partial<ActiveEntity<Setup>>;
  activeCost?: Partial<ActiveEntity<Cost[]>>;
  setupFilters?: Query<SetupFilter>;
  httpError?: Partial<HttpError>;
}

export const reducers: ActionReducerMap<DraftManagementState> = {
  setups: setupReducer,
  activeSetup: activeSetupReducer,
  setupFilters: setupFiltersReducer,
  activeCost: activeCostReducer,
  httpError: httpErrorReducer,
}

export const selectDraftsManager = createFeatureSelector<DraftManagementState>("draft-manager");
