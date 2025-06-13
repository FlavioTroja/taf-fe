import { createAction, props } from "@ngrx/store";
import { Notification } from "../../../models/Notification";

export const uiToggleSidebarCollapsed = createAction("[UI] Sidebar toggle");
export const uiSetSidebarCollapseState = createAction("[UI] Set sidebar collapsed", props<{ value: boolean }>());

export const uiToggleSidebarExpandRoute = createAction("[UI] Sidebar toggle expand route", props<{ expand?: { path: string } }>());

export const setUiNotification = createAction("[UI] Set ui notification", props<{ notification: Omit<Notification, "code"> }>());

export const removeSelectedNotification = createAction("[UI] Remove selected notification", props<{ code: string }>());
export const clearUINotification = createAction("[UI] Clear ui notification");
