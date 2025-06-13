import { UIState } from "./ui.reducer";
import { AppState } from "../../../app.config";
import { createSelector } from "@ngrx/store";

export const selectSidebar = (state: AppState) => state.ui;

export const selectUISidebarCollapsed = createSelector(
  selectSidebar,
  (state: UIState) => state.sidebar.collapsed
);

export const selectUISidebarExpandedPath = createSelector(
  selectSidebar,
  (state: UIState) => state.sidebar.expand?.path
);

export const selectUINotification = createSelector(
  selectSidebar,
  (state: UIState) => state.notifications
);

