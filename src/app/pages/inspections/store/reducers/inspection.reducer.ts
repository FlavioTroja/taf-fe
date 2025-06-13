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
  on(InspectionActions.loadAllInspectionsSuccess, (state, { inspections }) => ({
      ...state,
      docs: inspections,
  })),
  on(InspectionActions.editInspectionFilterSuccess, (state, { filters }) => ({
    ...state,
    filters: {
      query: filters.query || {},
      populate: filters.populate || ""
    }
  })),
  on(InspectionActions.clearInspectionFilter, (state) => ({
    ...state,
    filters: {}
  }))
);

export function reducer(state: FilteredEntity<Inspection, InspectionFilter> | undefined, action: Action) {
  return inspectionReducer(state, action)
}
