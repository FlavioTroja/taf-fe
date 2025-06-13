import {createAction, props} from "@ngrx/store";
import {
  Cost,
  PartialSetupForm,
  Setup,
  SetupFilter,
  SetupStatus
} from "../../../../models/Setup";
import {HttpError} from "../../../../models/Notification";
import { Query } from "../../../../../global";
import { PaginateDatasource } from "../../../../models/Table";

export const editSetup = createAction("[Draft] Edit setup");
export const editSetupSuccess = createAction("[Draft] Edit setup Success", props<{ setup: PartialSetupForm }>());
export const editSetupFailed = createAction("[Draft] Edit setup Failed", props<{ error: HttpError }>());

export const editSetupDraft = createAction("[Draft] Edit setup draft");
export const editSetupDraftSuccess = createAction("[Draft] Edit setup draft Success", props<{ setup: PartialSetupForm }>());
export const editSetupDraftFailed = createAction("[Draft] Edit setup draft Failed", props<{ error: HttpError }>());

export const setupActiveChanges = createAction("[Draft] On setup change prop", props<{ changes: PartialSetupForm }>());

export const clearSetupChanges = createAction("[Draft] Clear setup changes");

export const clearSetupActive = createAction("[Draft] Clear setup active");

export const deleteSetup = createAction("[SetUps] Delete", props<{ id: number }>());
export const deleteSetupSuccess = createAction("[SetUps] Delete setup Success", props<{ setup: Setup }>());
export const deleteSetupFailed = createAction("[SetUps] Delete setup Failed", props<{ error: HttpError }>());

export const loadSetups = createAction("[Draft] Load all setups", props<{ query: Query<SetupFilter> }>());
export const loadSetupsSuccess = createAction("[Draft] Load all setups Success", props<{ setups: PaginateDatasource<Setup> }>());
export const loadSetupsFailed = createAction("[Draft] Load all setups Failed", props<{ error: HttpError }>());

export const editSetupsFilter = createAction("[Draft] Edit setup filter", props<{ filters: Query<SetupFilter> }>());
export const editSetupsFilterSuccess = createAction("[Draft] Edit setup filter success", props<{ filters: Query<SetupFilter> }>());
export const clearSetupsFilter = createAction("[Draft] Edit setup filter failed");

export const getSetup = createAction("[Draft] Get setup", props<{ id: number }>());
export const getSetupSuccess = createAction("[Draft] Get setup Success", props<{ current: Setup }>());
export const getSetupFailed = createAction("[Draft] Get setup Failed", props<{ error: HttpError }>());

export const quoteDraft = createAction("[Draft] Quote draft", props<{ id: number }>());
export const quoteDraftSuccess = createAction("[Draft] Quote draft Success", props<{ newStatus: SetupStatus }>());
export const quoteDraftFailed = createAction("[Draft] Quote draft Failed", props<{ error: HttpError }>());

export const backToDraft = createAction("[Draft] From quote back to draft", props<{ id: number }>());
export const backToDraftSuccess = createAction("[Draft] From quote back to draft Success", props<{ newStatus: SetupStatus }>());
export const backToDraftFailed = createAction("[Draft] From quote back to draft Failed", props<{ error: HttpError }>());

export const confirmQuote = createAction("[Draft] Confirm quote", props<{ id: number }>());
export const confirmQuoteSuccess = createAction("[Draft] Confirm quote Success", props<{ newStatus: SetupStatus }>());
export const confirmQuoteFailed = createAction("[Draft] Confirm quote Failed", props<{ error: HttpError }>());

export const toggleDraftCanceled = createAction("[Draft] Set setupStatus from DRAFT/QUOTE to CANCELED or viceversa", props<{ id: number }>());
export const toggleDraftCanceledSuccess = createAction("[Draft] Toggle setupStatus success", props<{ newStatus: SetupStatus }>());
export const toggleDraftCanceledFailed = createAction("[Draft] Toggle setupStatus failed", props<{ error: HttpError }>());

export const editCostsActiveChanges = createAction("[Draft] Edit active costs", props<{ changes: Cost[] }>());
export const clearCostsActiveChanges = createAction("[Draft] Clear active costs");
