import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { ActiveEntity } from "../../../../../global";
import { Municipality } from "../../../../models/Municipalities";
import { HttpError } from "../../../../models/Notification";
import { PaginateDatasource } from "../../../../models/Table";
import { reducer as municipalitiesReducer } from "./municipalities.reducer";

export interface MunicipalitiesManagementState {
    municipalities?: Partial<PaginateDatasource<Municipality>>;
    active?: Partial<ActiveEntity<Municipality>>;
    httpError?: Partial<HttpError>
}

export const reducers: ActionReducerMap<MunicipalitiesManagementState> = {
    municipalities: municipalitiesReducer,
}

export const selectMunicipalitiesManager = createFeatureSelector<MunicipalitiesManagementState>('municipalities-manager');
