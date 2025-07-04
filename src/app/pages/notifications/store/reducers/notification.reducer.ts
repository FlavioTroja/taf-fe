import { Action, createReducer, on } from "@ngrx/store";
import { Notification } from "../../../../models/Notifications";
import { PaginateDatasource } from "../../../../models/Table";
import * as NotificationsActions from "../actions/notification.actions";


const initialState: Partial<PaginateDatasource<Notification>> = {};

const notificationReducer = createReducer(
  initialState,
  on(NotificationsActions.loadPaginateNotificationsSuccess, (state, { notifications }) => ({
    ...notifications
  })),
)

export function reducer(state: Partial<PaginateDatasource<Notification>> | undefined, action: Action) {
  return notificationReducer(state, action)
}
