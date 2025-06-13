import { Action, createReducer, on } from "@ngrx/store";
import * as InspectionActions from "../actions/inspections.actions";
import { Inspection, InspectionFilter } from "../../../../models/Inspection";
import { FilteredEntity } from "../../../../../global";

const initialState: FilteredEntity<Inspection, InspectionFilter> = {
  docs: [],
  filters: {}
};

const inspectionReducer = createReducer(
  initialState,
  on(InspectionActions.loadAllSelectiveInspectionsSuccess, (state, { inspections }) => ({
      ...state,
      docs: inspections,
  })),
  on(InspectionActions.editSelectiveInspectionFilterSuccess, (state, { filters }) => ({
    ...state,
    filters: {
      query: filters.query || {},
      populate: filters.populate || ""
    }
  })),
  on(InspectionActions.clearSelectiveInspectionFilter, (state) => ({
    ...state,
    filters: {}
  })),
  on(InspectionActions.resetSelectiveInspection, (state) => ({
    ...state,
    filters: {},
    docs: []
  }))
);

export function reducer(state: FilteredEntity<Inspection, InspectionFilter> | undefined, action: Action) {
  return inspectionReducer(state, action)
}
