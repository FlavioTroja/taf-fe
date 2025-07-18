export interface Notification {
  type: NOTIFICATION_LISTENER_TYPE,
  code: string,
  title?: string,
  message: string
}

export interface HttpError {
  statusCode: number,
  statusText: string,
  error: any
}

export enum NOTIFICATION_LISTENER_TYPE {
  ERROR = "ERROR",
  WARNING = "WARNING",
  INFO = "INFO",
  SUCCESS = "SUCCESS",
}

export const NotificationData = [
  { type: NOTIFICATION_LISTENER_TYPE.ERROR, icon: "warning", defaultTitle: "ERROR" },
  { type: NOTIFICATION_LISTENER_TYPE.WARNING, icon: "warning", defaultTitle: "WARNING" },
  { type: NOTIFICATION_LISTENER_TYPE.INFO, icon: "info", defaultTitle: "INFO" },
  { type: NOTIFICATION_LISTENER_TYPE.SUCCESS, icon: "done", defaultTitle: "SUCCESS" }
];

export interface CurrentNotification {
  code: string,
  type: NOTIFICATION_LISTENER_TYPE,
  icon: string,
  title: string,
  message: string
}
