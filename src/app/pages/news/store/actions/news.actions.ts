import { createAction, props } from "@ngrx/store";
import { QuerySearch } from "../../../../../global";
import { News, PartialNews } from "../../../../models/News";
import { HttpError } from "../../../../models/Notification";
import { PaginateDatasource } from "../../../../models/Table";

export const deleteNews = createAction("[News] Delete News]", props<{ id: string }>());
export const deleteNewsFailed = createAction("[News] Delete News Failed]", props<{
  error: HttpError
}>());

export const loadPaginateNews = createAction("[News] Load News", props<{ query: QuerySearch<string, string> }>());
export const loadPaginateNewsSuccess = createAction("[News] Load News Success", props<{
  news: PaginateDatasource<News>
}>())
export const loadPaginateNewsFailed = createAction("[News] Load News Failed", props<{
  error: HttpError
}>())

export const newsActiveChanges = createAction("[News] On News change prop", props<{
  changes: PartialNews
}>());

export const getNews = createAction("[News] Get Active News", props<{ id: string }>());
export const getNewsSuccess = createAction("[News] Get Active News Success", props<{
  current: News
}>());
export const getNewsFailed = createAction("[News] Get Active News Failed", props<{
  error: HttpError
}>());

export const addNews = createAction("[News] Add News", props<{ news: PartialNews }>());
export const addNewsSuccess = createAction("[News] Add News Success", props<{
  news: PartialNews
}>());
export const addNewsFailed = createAction("[News] Add News Failed", props<{
  error: HttpError
}>());


export const editNews = createAction("[News] Edit News")
export const editNewsSuccess = createAction("[News] Edit News Success", props<{
  news: PartialNews
}>())
export const editNewsFailed = createAction("[News] Edit News Failed", props<{
  error: HttpError
}>())

export const clearNewsActive = createAction("[News] Clear Active changes");




