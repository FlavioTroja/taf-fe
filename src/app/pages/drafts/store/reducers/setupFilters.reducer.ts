import { Action, createReducer, on } from "@ngrx/store";
import * as DraftsActions from "../../../drafts/store/actions/drafts.actions";
import { Query } from "../../../../../global";
import { SetupFilter } from "../../../../models/Setup";

const initialState: Query<SetupFilter> = {
  query: {
    value: ""
  },
  options: {
    limit: 10,
    page: 1
  }
}

const setupFilterReducer = createReducer(
  initialState,
  on(DraftsActions.editSetupsFilterSuccess, (state, { filters }) => ({
    query: filters.query || {},
    options: filters.options || {}
  })),
  on(DraftsActions.clearSetupsFilter, (state) => ( {} ))
);

export function reducer(state: Query<SetupFilter> | undefined, action: Action) {
  return setupFilterReducer(state, action)
}
