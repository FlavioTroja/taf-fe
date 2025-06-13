import { createAction, props } from "@ngrx/store";
import { DefaultQueryParams, Query } from "../../../../../global";
import { PaginateDatasource } from "../../../../models/Table";
import { BatchCargo, BatchCargoSection, Cargo, CargoFilter } from "../../../../models/Cargo";
import { HttpError } from "../../../../models/Notification";
import { MoveProductDTO } from "../../../../models/Product";

export const loadCargos = createAction("[Cargos] Load");

export const loadCargosSuccess = createAction("[Cargos] Load Success", props<{ cargos: PaginateDatasource<Cargo> }>());

export const loadCargosFailed = createAction("[Cargos] Load Failed", props<{ error: HttpError }>());

export const getCargo = createAction("[Cargos] Get", props<{ id: number, params?: DefaultQueryParams }>());

export const getCargoSuccess = createAction("[Cargos] Get cargo Success", props<{ current: Cargo }>());

export const getCargoFailed = createAction("[Cargos] Get Failed", props<{ error: HttpError }>());

export const createCargo = createAction("[Cargos] Create", props<{ cargo: MoveProductDTO }>());

export const createCargoSuccess = createAction("[Cargos] Create cargo Success", props<{ cargo: Cargo }>());

export const createCargoFailed = createAction("[Cargos] Create Failed", props<{ error: HttpError }>());

export const clearCargoHttpError = createAction("[Cargos] Clear Http Error");

export const clearCargoActive = createAction("[Cargos] Clear Active changes");

export const batchCargoActiveChanges = createAction("[Cargos] On batch cargo change prop", props<{ changes: BatchCargo[] }>());

export const clearBatchCargoActive = createAction("[Cargos] Clear Active Batch changes");

export const batchCargoCreate = createAction("[Cargos] Create Batch");

export const createBulkCargoFromOrder = createAction("[Cargos] Create Batch From Order", props<{ cargo: BatchCargo[] }>());

export const batchCargoSuccess = createAction("[Cargos] Create Batch Success", props<{ cargo: { productId: number, done: boolean }[] }>());

export const batchCargoFailed = createAction("[Cargos] Create Batch Failed", props<{ error: HttpError }>());

export const editCargoFilter = createAction("[Cargos] Edit product filter", props<{ filters: Query<CargoFilter> }>());
export const editCargoFilterSuccess = createAction("[Cargos] Edit product filter success", props<{ filters: Query<CargoFilter> }>());
export const clearCargoFilter = createAction("[Cargos] Edit product filter");


export const bulkCargoActiveChanges = createAction("[Cargos] On bulk cargo change prop", props<{ changes: BatchCargo }>());

export const bulkCargoSetItems = createAction("[Cargos] On bulk cargo set items", props<{ items: BatchCargoSection[] }>());

export const bulkCargoAddItem = createAction("[Cargos] On bulk cargo add item", props<{ item: BatchCargoSection }>());

export const bulkCargoUpdateItemQuantity = createAction("[Cargos] On bulk cargo update item quantity", props<{ code: string, newQta: number }>());

export const bulkCargoRemoveItem = createAction("[Cargos] On bulk cargo remove item", props<{ code: string }>());

export const bulkCargoClearItems = createAction("[Cargos] On bulk cargo clear items");
