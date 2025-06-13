import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { reducer as resourceReducer } from "./resources.reducer";
import { reducer as httpErrorReducer } from "./http-error.reducer";
import { reducer as activeReducer } from "./active.reducer";
import { reducer as filtersReducer } from "./filters.reducer";
import { HttpError } from "../../../../models/Notification";
import { PaginateDatasource } from "../../../../models/Table";
import { ActiveEntity, Query } from "../../../../../global";
import {Resource, ResourceFilter} from "../../../../models/Resource";

export interface ResourceManagementState {
  resources?: Partial<PaginateDatasource<Resource>>;
  filters?: Query<ResourceFilter>;
  active?: Partial<ActiveEntity<Resource>>;
  httpError?: Partial<HttpError>;
}

export const reducers: ActionReducerMap<ResourceManagementState> = {
  resources: resourceReducer,
  filters: filtersReducer,
  active: activeReducer,
  httpError: httpErrorReducer
}

export const selectResourcesManager = createFeatureSelector<ResourceManagementState>("resource-manager");
