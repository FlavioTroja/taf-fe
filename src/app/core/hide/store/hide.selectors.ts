import { createSelector } from "@ngrx/store";
import { AppState } from "../../../app.config";
import { HideState } from "./hide.reducer";

export const getHide = (state: AppState) => state.hide;

export const getHideSections = createSelector(
  getHide,
  (state: HideState) => state.sections
);
