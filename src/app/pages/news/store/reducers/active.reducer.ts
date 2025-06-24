import { Action, createReducer, on } from "@ngrx/store";
import { ActiveEntity } from "../../../../../global";
import { News } from "../../../../models/News";
import * as NewsActions from "../actions/news.actions";


const initialState: Partial<ActiveEntity<News>> = {}

const activeNewsReducer = createReducer(
  initialState,
  on(NewsActions.getNewsSuccess, (state, { current }) => ({
    current,
  })),
  on(NewsActions.newsActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
)

export function reducer(state: Partial<ActiveEntity<News>> | undefined, action: Action) {
  return activeNewsReducer(state, action)
}
