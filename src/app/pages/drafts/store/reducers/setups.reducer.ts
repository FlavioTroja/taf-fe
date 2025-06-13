import { Action, createReducer, on } from "@ngrx/store";
import { Setup } from "../../../../models/Setup";
import * as DraftsActions from "../actions/drafts.actions";
import { PaginateDatasource } from "../../../../models/Table";

const initialState: Partial<PaginateDatasource<Setup>> = {};

const setupReducer = createReducer(
  initialState,
  on(DraftsActions.loadSetupsSuccess, (state, { setups }) => ({
    ...setups,
  })),
  on(DraftsActions.editSetupsFilterSuccess, (state, { filters }) => ({
    ...state,
    filters: {
      query: filters.query || {},
      populate: filters.options?.populate || ""
    }
  })),
  on(DraftsActions.clearSetupsFilter, (state) => ({
    ...state,
    filters: {}
  }))
);

export function reducer(state: Partial<PaginateDatasource<Setup>> | undefined, action: Action) {
  return setupReducer(state, action)
}
