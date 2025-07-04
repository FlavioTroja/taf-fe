import { createAction, props } from "@ngrx/store";
import { QuerySearch } from "../../../../../global";
import { HttpError } from "../../../../models/Notification";
import { Notification, PartialNotification } from "../../../../models/Notifications";
import { PaginateDatasource } from "../../../../models/Table";
import { PartialUser } from "../../../../models/User";

export const deleteNotification = createAction("[Notifications] Delete Notification]", props<{ id: string }>());
export const deleteNotificationFailed = createAction("[Notifications] Delete Notification Failed]", props<{
  error: HttpError
}>());

export const loadPaginateNotifications = createAction("[Notifications] Load Notifications", props<{
  query: QuerySearch<string, string>
}>());
export const loadPaginateNotificationsSuccess = createAction("[Notifications] Load Notifications Success", props<{
  notifications: PaginateDatasource<Notification>
}>())
export const loadPaginateNotificationsFailed = createAction("[Notifications] Load Notifications Failed", props<{
  error: HttpError
}>())

export const notificationActiveChanges = createAction("[Notifications] On Notification change prop", props<{
  changes: PartialNotification
}>());

export const getNotification = createAction("[Notifications] Get Active Notification", props<{ id: string }>());
export const getNotificationSuccess = createAction("[Notifications] Get Active Notification Success", props<{
  current: Notification, recipient?: PartialUser
}>());
export const getNotificationFailed = createAction("[Notifications] Get Active Notification Failed", props<{
  error: HttpError
}>());

export const addNotification = createAction("[Notifications] Add Notification", props<{
  notification: PartialNotification
}>());
export const addNotificationSuccess = createAction("[Notifications] Add Notification Success", props<{
  notification: PartialNotification
}>());
export const addNotificationFailed = createAction("[Notifications] Add Notification Failed", props<{
  error: HttpError
}>());


export const editNotification = createAction("[Notifications] Edit Notification")
export const editNotificationSuccess = createAction("[Notifications] Edit Notification Success", props<{
  notification: PartialNotification
}>())
export const editNotificationFailed = createAction("[Notifications] Edit Notification Failed", props<{
  error: HttpError
}>())

export const clearNotificationActive = createAction("[Notifications] Clear Active changes");

export const toggleReadNotification = createAction("[Notifications] Toggle Read Notification]", props<{ id: string }>())

