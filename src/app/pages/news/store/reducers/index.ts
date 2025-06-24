import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { ActiveEntity } from "../../../../../global";
import { News } from "../../../../models/News";
import { HttpError } from "../../../../models/Notification";
import { PaginateDatasource } from "../../../../models/Table";
import { reducer as activeNewsReducer } from "./active.reducer";
import { reducer as newsReducer } from "./news.reducer";

export interface NewsManagementState {
  news?: Partial<PaginateDatasource<News>>;
  active?: Partial<ActiveEntity<News>>;
  httpError?: Partial<HttpError>
}

export const reducers: ActionReducerMap<NewsManagementState> = {
  news: newsReducer,
  active: activeNewsReducer,
}

export const selectNewsManager = createFeatureSelector<NewsManagementState>('news-manager');
