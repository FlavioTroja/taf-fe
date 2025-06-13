import { createSelector } from "@ngrx/store";
import { selectResourcesManager, ResourceManagementState } from "../reducers";

export const getResourcesPaginate = createSelector(
  selectResourcesManager,
  (state?: ResourceManagementState) => state?.resources
)

export const getCurrentResource = createSelector(
  selectResourcesManager,
  (state?: ResourceManagementState) => state?.active?.current
)

export const getActiveResourceChanges = createSelector(
  selectResourcesManager,
  (state?: ResourceManagementState) => state?.active?.changes ?? {}
)

export const getResourcesHttpError = createSelector(
  selectResourcesManager,
  (state?: ResourceManagementState) => state?.httpError
)

export const getResourceFilter = createSelector(
  selectResourcesManager,
  (state?: ResourceManagementState) => state?.filters
);

export const getContentOfResourceDeleteModel = createSelector(
  selectResourcesManager,
  (state?: ResourceManagementState) => `
  Si sta eliminando l' operaio ${state?.active?.current?.name}.
  <br>
  Questa operazione non è reversibile.
  `
);
