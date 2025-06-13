import {createAction, props} from "@ngrx/store";
import {PartialResource, Resource} from "../../../../models/Resource";
import {HttpError} from "../../../../models/Notification";
import {DefaultQueryParams, Query} from "../../../../../global";
import {PaginateDatasource} from "../../../../models/Table";
import {ResourceFilter} from "../../../../models/Resource";

export const addResource = createAction("[Resources] Add", props<{ resource: PartialResource }>());
export const addResourceSuccess = createAction("[Resources] Add resource Success", props<{ resource: Resource }>());
export const addResourceFailed = createAction("[Resources] Add Failed", props<{ error: HttpError }>());

export const getResource = createAction("[Resources] Get", props<{ id: number, params?: DefaultQueryParams }>());
export const getResourceSuccess = createAction("[Resources] Get resource Success", props<{ current: Resource }>());
export const getResourceFailed = createAction("[Resources] Get Failed", props<{ error: HttpError }>());

export const resourceActiveChanges = createAction("[Resources] On resource change prop", props<{ changes: PartialResource }>());

export const clearResourceActive = createAction("[Resources] Clear Active changes");

export const editResource = createAction("[Resources] Edit");
export const editResourceSuccess = createAction("[Resources] Edit resource Success", props<{ resource: Resource }>());
export const editResourceFailed = createAction("[Resources] Edit Failed", props<{ error: HttpError }>());

export const deleteResource = createAction("[Resources] Delete", props<{ id: number }>());
export const deleteResourceSuccess = createAction("[Resources] Delete resource Success", props<{ resource: Resource }>());
export const deleteResourceFailed = createAction("[Resources] Delete Failed", props<{ error: HttpError }>());

export const loadResources = createAction("[Resources] Load");
export const loadResourcesSuccess = createAction("[Resources] Load Success", props<{ resources: PaginateDatasource<Resource> }>());
export const loadResourcesFailed = createAction("[Resources] Load Failed", props<{ error: HttpError }>());

export const clearResourceHttpError = createAction("[Resources] Clear Http Error");

export const editResourceFilter = createAction("[Resources] Edit resource filter", props<{ filters: Query<ResourceFilter> }>());
export const editResourceFilterSuccess = createAction("[Resources] Edit resource filter success", props<{ filters: Query<ResourceFilter> }>());
export const clearResourceFilter = createAction("[Resources] Edit resource filter");

export const deleteResourceFromView = createAction("[Resources] Delete resource from view", props<{ id: number }>());
