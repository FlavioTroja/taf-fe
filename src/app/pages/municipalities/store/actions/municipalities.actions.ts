import { createAction, props } from "@ngrx/store";
import { Municipality } from "../../../../models/Municipalities";
import { HttpError } from "../../../../models/Notification";
import { PaginateDatasource } from "../../../../models/Table";

export const deleteMunicipalities = createAction("[Municipalities] Delete User]", props<{ id: string }>());

export const loadMunicipalities = createAction("[Municipalities] Load Municipalities");
export const loadMunicipalitiesSuccess = createAction("[Municipalities] Load Municipalities Success]", props<{
  municipalities: PaginateDatasource<Municipality>
}>())

export const loadMunicipalitiesFailed = createAction("[Municipalities] Load Municipalities Failed]", props<{
  error: HttpError
}>())
