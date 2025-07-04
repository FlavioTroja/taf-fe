import { RouterReducerState } from "@ngrx/router-store";
import { createSelector } from "@ngrx/store";
import { AppState } from "../../../app.config";

export const getRouter = (state: AppState) => state.router;

export const getRouterUrl = createSelector(
  getRouter,
  (state: RouterReducerState) => state?.state.url
)

export const selectCustomRouteParam = (param: string) => createSelector(
  getRouter,
  (router: RouterReducerState) => {
    let current = router?.state.root;

    while (current) {
      if (current.params && current.params[param]) {
        return current.params[param];
      }
      current = current.firstChild!;
    }
  }
);

export const selectRouteUrl = createSelector(
  getRouter,
  (router: RouterReducerState) => {
    return router?.state.url;
  }
)

export const selectRouteQueryParamParam = () => createSelector(
  getRouter,
  (router: RouterReducerState) => {
    let current = router?.state.root;

    while (current) {
      if (current.queryParams && Object.keys(current.queryParams).length !== 0) {
        return current.queryParams;
      }
      current = current.firstChild!;
    }
    return undefined;
  }
);

export const getRouterNavigationId = createSelector(
  getRouter,
  (state: RouterReducerState) => state?.navigationId
)

export const getRouterData = createSelector(
  getRouter,
  (router: RouterReducerState) => {
    if (!router) {
      return;
    }
    let current = router.state.root;

    while (current.firstChild) {
      current = current.firstChild;
    }

    return current?.data
  }
);

export const getCurrentRouter = createSelector(
  getRouter,
  (router: RouterReducerState) => {
    if (!router) {
      return;
    }
    let current = router.state.root;

    while (current.firstChild) {
      current = current.firstChild;
    }

    return current
  }
)
