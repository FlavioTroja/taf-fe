import { createAction, props } from "@ngrx/store";
import { Municipal, PartialMunicipal } from "../../../../models/Municipals";
import { HttpError } from "../../../../models/Notification";
import { PaginateDatasource } from "../../../../models/Table";

export const deleteMunicipal = createAction("[Municipals] Delete Municipal]", props<{ id: string }>());
export const deleteMunicipalFailed = createAction("[Municipals] Delete Municipal Failed]", props<{
  error: HttpError
}>());

export const loadMunicipals = createAction("[Municipals] Load Municipals");
export const loadMunicipalsSuccess = createAction("[Municipals] Load Municipals Success", props<{
  municipals: PaginateDatasource<Municipal>
}>())
export const loadMunicipalsFailed = createAction("[Municipals] Load Municipals Failed", props<{
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




