import { Action, createReducer, on } from "@ngrx/store";
import { News } from "../../../../models/News";
import { PaginateDatasource } from "../../../../models/Table";
import * as ActivitiesActions from "../actions/news.actions";


const initialState: Partial<PaginateDatasource<News>> = {};

const newsReducer = createReducer(
  initialState,
  on(ActivitiesActions.loadNewsSuccess, (state, { news }) => ({
    ...news
  })),
)

export function reducer(state: Partial<PaginateDatasource<News>> | undefined, action: Action) {
  return newsReducer(state, action)
}
