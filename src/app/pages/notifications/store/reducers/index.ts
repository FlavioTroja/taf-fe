import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { ActiveEntity } from "../../../../../global";
import { HttpError } from "../../../../models/Notification";
import { Notification } from "../../../../models/Notifications";
import { PaginateDatasource } from "../../../../models/Table";
import { reducer as activeNotificationReducer } from "./active.reducer";
import { reducer as notificationReducer } from "./notification.reducer";

export interface NotificationsManagementState {
  notifications?: Partial<PaginateDatasource<Notification>>;
  active?: Partial<ActiveEntity<Notification>>;
  httpError?: Partial<HttpError>
}

export const reducers: ActionReducerMap<NotificationsManagementState> = {
  notifications: notificationReducer,
  active: activeNotificationReducer,
}

export const selectNotificationsManager = createFeatureSelector<NotificationsManagementState>('notifications-manager');
