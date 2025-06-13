import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { reducer as httpErrorReducer } from "./http-error.reducer";
import { reducer as setupReducer } from "./setup.reducer";
import { reducer as inspectionsReducer } from "./inspection.reducer";
import { reducer as selectiveInspectionsReducer } from "./selectiveInspection.reducer";
import { reducer as activeInspectionReducer } from "./activeInspection.reducer";
import { HttpError } from "../../../../models/Notification";
import { ActiveEntity, FilteredEntity } from "../../../../../global";
import { SetupForm } from "../../../../models/Setup";
import { Inspection, InspectionFilter } from "../../../../models/Inspection";

export interface InspectionManagementState {
  setup?: Partial<ActiveEntity<SetupForm>>;
  inspections?: FilteredEntity<Inspection, InspectionFilter>;
  selectiveInspections?: FilteredEntity<Inspection, InspectionFilter>;
  activeInspection?: Partial<ActiveEntity<Inspection>>;
  httpError?: Partial<HttpError>;
}

export const reducers: ActionReducerMap<InspectionManagementState> = {
  setup: setupReducer,
  inspections: inspectionsReducer,
  selectiveInspections: selectiveInspectionsReducer,
  activeInspection: activeInspectionReducer,
  httpError: httpErrorReducer,
}

export const selectInspectionsManager = createFeatureSelector<InspectionManagementState>("inspection-manager");
