import { createAction, props } from "@ngrx/store";
import { HttpError } from "../../../../models/Notification";
import { PartialSetup, PartialSetupForm, PlanningSetupUpdate, Setup, SetupCreate } from "../../../../models/Setup";
import { DefaultQueryParams, Query, QueryAll } from "../../../../../global";
import {
  Inspection,
  InspectionDetails,
  InspectionFilter,
  InspectionStatusDTO,
  PartialInspection, PartialInspectionDetails
} from "../../../../models/Inspection";

// SETUP ACTIONS

export const addSetup = createAction("[Inspections] Add SetUp", props<{ setUp: SetupCreate }>());
export const addSetupSuccess = createAction("[Inspections] Add SetUp Success", props<{ setUp: Setup }>());
export const addSetupFailed = createAction("[Inspections] Add SetUp failed", props<{ error: HttpError }>());


export const editSetup = createAction("[Inspections] Edit");
export const editSetupSuccess = createAction("[Inspections] Edit setup Success", props<{ setUp: PartialSetupForm }>());
export const editSetupFailed = createAction("[Inspections] Edit setup Failed", props<{ error: HttpError }>());

export const setupActiveChanges = createAction("[Inspections] On SetUp change prop", props<{ changes: PartialSetupForm }>());

export const clearSetupActive = createAction("[Inspections] Clear SetUp changes");

export const getSetup = createAction("[Inspections] Get SetUp", props<{ id: number, params?: DefaultQueryParams }>());
export const getSetupSuccess = createAction("[Inspections] Get SetUp Success", props<{ current: Setup }>());
export const getSetupFailed = createAction("[Inspections] Get SetUp Failed", props<{ error: HttpError }>());

export const editSetupPlanning = createAction("[Inspections] Edit planning", props<{ id: number, setUpPlanningDetails: PlanningSetupUpdate }>());
export const editSetupPlanningSuccess = createAction("[Inspections] Edit setup planning Success", props<{ setUp: PartialSetup }>());
export const editSetupPlanningFailed = createAction("[Inspections] Edit setup planning Failed", props<{ error: HttpError }>());

// INSPECTION ACTIONS

export const clearInspectionHttpError = createAction("[Inspections] Clear Http Error");

export const loadAllInspections = createAction("[Inspections] Load all", props<{ query: Query<object> }>());
export const loadAllInspectionsSuccess = createAction("[Inspections] Load all Success", props<{ inspections: Inspection[] }>());
export const loadAllInspectionsFailed = createAction("[Inspections] Load all Failed", props<{ error: HttpError }>());

export const editInspectionFilter = createAction("[Inspections] Edit inspection filter", props<{ filters: QueryAll<InspectionFilter> }>());
export const editInspectionFilterSuccess = createAction("[Inspections] Edit inspection filter success", props<{ filters: QueryAll<InspectionFilter> }>());
export const clearInspectionFilter = createAction("[Inspections] Edit inspection filter failed");

export const loadAllSelectiveInspections = createAction("[Inspections] Load selective all", props<{ query: QueryAll<InspectionFilter> }>());
export const loadAllSelectiveInspectionsSuccess = createAction("[Inspections] Load selective all Success", props<{ inspections: Inspection[] }>());
export const loadAllSelectiveInspectionsFailed = createAction("[Inspections] Load selective all Failed", props<{ error: HttpError }>());

export const editSelectiveInspectionFilter = createAction("[Inspections] Edit selective inspection filter", props<{ filters: QueryAll<InspectionFilter> }>());
export const editSelectiveInspectionFilterSuccess = createAction("[Inspections] Edit selective inspection filter success", props<{ filters: QueryAll<InspectionFilter> }>());
export const clearSelectiveInspectionFilter = createAction("[Inspections] Edit selective inspection filter failed");
export const resetSelectiveInspection = createAction("[Inspections] Reset selective inspections and their filter");

export const clearInspectionActive = createAction("[Inspections] Clear Inspection Active");
export const clearInspectionActiveChanges = createAction("[Inspections] Clear Inspection Active changes");

export const deleteInspection = createAction("[Inspections] Delete", props<{ id: number }>());
export const deleteInspectionSuccess = createAction("[Inspections] Delete inspection Success", props<{ inspection: Inspection }>());
export const deleteInspectionFailed = createAction("[Inspections] Delete inspection Failed", props<{ error: HttpError }>());

export const navigateOnInspectionCustomer = createAction("[Inspections] Navigate on inspection customer", props<{ id: number }>())
export const navigateOnInspectionView = createAction("[Inspections] Navigate on inspection view", props<{ id: number }>())

export const getInspection = createAction("[Inspections] Get Inspection", props<{ id: number }>());
export const getInspectionSuccess = createAction("[Inspections] Get Inspection Success", props<{ current: Inspection }>());
export const getInspectionFailed = createAction("[Inspections] Get Inspection Failed", props<{ error: HttpError }>());

export const inspectionActiveChanges = createAction("[Inspections] On inspection change prop", props<{ changes: PartialInspection }>());

export const editInspection = createAction("[Inspections] Edit");
export const editInspectionSuccess = createAction("[Inspections] Edit inspection Success", props<{ inspection: Inspection }>());
export const editInspectionFailed = createAction("[Inspections] Edit inspection Failed", props<{ error: HttpError }>());

export const updateInspectionStatus = createAction("[Inspections] update inspection status action", props<{ id: number, inspectionStatusPayload: InspectionStatusDTO }>());
export const updateInspectionStatusSuccess = createAction("[Inspections] update inspection status action success");
export const updateInspectionStatusFailed = createAction("[Inspections] update inspection status action failed", props<{ error: HttpError }>());

export const completeInspectionStatus = createAction("[Inspections] Complete inspection status action", props<{ id: number }>());
export const completeInspectionStatusSuccess = createAction("[Inspections] Succeed Complete inspection status action");
export const completeInspectionStatusFailed = createAction("[Inspections] Failed Complete inspection status action", props<{ error: HttpError }>());

export const editInspectionDetails = createAction("[Inspections] Edit inspection details action", props<{ id: number, inspectionDetails: InspectionDetails }>());
export const editInspectionDetailsSuccess = createAction("[Inspections] Succeed Edit inspection details action", props<{ inspection: PartialInspectionDetails }>());
export const editInspectionDetailsFailed = createAction("[Inspections] Failed Edit inspection details action", props<{ error: HttpError }>());
