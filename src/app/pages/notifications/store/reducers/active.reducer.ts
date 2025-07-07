import { Action, createReducer, on } from "@ngrx/store";
import { ActiveEntity } from "../../../../../global";
import { Notification } from "../../../../models/Notifications";
import * as NotificationActions from "../actions/notification.actions";


const initialState: Partial<ActiveEntity<Notification>> = {}

const activeNotificationReducer = createReducer(
  initialState,
  on(NotificationActions.getNotificationSuccess, (state, { current, recipient }) => ({
    current: {
      ...current,
      recipient
    },
  })),
  on(NotificationActions.notificationActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
  on(NotificationActions.clearNotificationActive, (state) => ({
    changes: undefined,
    current: undefined
  }))
)

export function reducer(state: Partial<ActiveEntity<Notification>> | undefined, action: Action) {
  return activeNotificationReducer(state, action)
}
