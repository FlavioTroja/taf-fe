import { createAction, props } from "@ngrx/store";
import { QuerySearch } from "../../../../../global";
import { Municipal, PartialMunicipal } from "../../../../models/Municipals";
import { HttpError } from "../../../../models/Notification";
import { PaginateDatasource } from "../../../../models/Table";

export const deleteMunicipal = createAction("[Municipals] Delete Municipal]", props<{ id: string }>());
export const deleteMunicipalFailed = createAction("[Municipals] Delete Municipal Failed]", props<{
  error: HttpError
}>());

export const loadMunicipalsPaginate = createAction("[Municipals] Load Municipals", props<{
  query: QuerySearch<string, string>
}>());
export const loadMunicipalsPaginateSuccess = createAction("[Municipals] Load Municipals Success", props<{
  municipals: PaginateDatasource<Municipal>
}>())
export const loadMunicipalsPaginateFailed = createAction("[Municipals] Load Municipals Failed", props<{
  error: HttpError
}>())

export const municipalActiveChanges = createAction("[Municipals] On Municipal change prop", props<{
  changes: PartialMunicipal
}>());

export const getMunicipal = createAction("[Municipals] Get Active Municipal", props<{ id: string }>());
export const getMunicipalSuccess = createAction("[Municipals] Get Active Municipal Success", props<{
  current: Municipal
}>());
export const getMunicipalFailed = createAction("[Municipals] Get Active Municipal Failed", props<{
  error: HttpError
}>());

export const addMunicipal = createAction("[Municipals] Add Municipal", props<{ municipal: PartialMunicipal }>());
export const addMunicipalSuccess = createAction("[Municipals] Add Municipal Success", props<{
  municipal: PartialMunicipal
}>());
export const addMunicipalFailed = createAction("[Municipals] Add Municipal Failed", props<{
  error: HttpError
}>());


export const editMunicipal = createAction("[Municipals] Edit Municipal")
export const editMunicipalSuccess = createAction("[Municipals] Edit Municipal Success", props<{
  municipal: PartialMunicipal
}>())
export const editMunicipalFailed = createAction("[Municipals] Edit Municipal Failed", props<{
  error: HttpError
}>())

export const clearMunicipalActive = createAction("[Municipals] Clear Active changes");



