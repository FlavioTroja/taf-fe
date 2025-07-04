import { createSelector } from "@ngrx/store";
import { NotificationsManagementState, selectNotificationsManager } from "../reducers";

export const getNotificationsPaginate = createSelector(
  selectNotificationsManager,
  (state?: NotificationsManagementState) => state?.notifications
)

export const getActiveNotification = createSelector(
  selectNotificationsManager,
  (state?: NotificationsManagementState) => state?.active?.current
)

export const getActiveNotificationChanges = createSelector(
  selectNotificationsManager,
  (state?: NotificationsManagementState) => state?.active?.changes ?? {}
)
