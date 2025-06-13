import { createSelector } from "@ngrx/store";
import { InspectionManagementState, selectInspectionsManager } from "../reducers";
import { InspectionStatus } from "../../../../models/Inspection";
import { selectProductsManager } from "../../../products/store/reducers";
import { getProfile } from "../../../../core/profile/store/profile.selectors";
import { ProfileState } from "../../../../core/profile/store/profile.reducer";
import { Roles } from "../../../../models/User";

// EDIT FORM INSPECTION

export const getFormChanges = createSelector(
  selectInspectionsManager,
  (state?: InspectionManagementState) =>  (state?.setup?.changes ?? state?.activeInspection?.changes) ?? {}
)

// SETUP SELECTORS

export const getSetupChanges = createSelector(
  selectInspectionsManager,
  (state?: InspectionManagementState) =>  state?.setup?.changes ?? {}
)

export const getCurrentSetup = createSelector(
  selectProductsManager,
  (state?: InspectionManagementState) => state?.setup?.current
)

// INSPECTIONS SELECTORS

export const getAllInspections = createSelector(
  selectInspectionsManager,
  (state?: InspectionManagementState) => state?.inspections?.docs
)

export const getAllInspectionsFilter = createSelector(
  selectInspectionsManager,
  (state?: InspectionManagementState) => state?.inspections?.filters
);

export const getSelectiveInspections = createSelector(
  selectInspectionsManager,
  (state?: InspectionManagementState) => state?.selectiveInspections?.docs
)

export const getSelectiveInspectionFilter = createSelector(
  selectInspectionsManager,
  (state?: InspectionManagementState) => state?.selectiveInspections?.filters ?? {}
);

export const getCurrentInspection = createSelector(
  selectInspectionsManager,
  (state?: InspectionManagementState) => state?.activeInspection?.current
)

export const isCurrentInspectionAccepted = createSelector(
  selectInspectionsManager,
  (state?: InspectionManagementState) => {
    return !((!!state?.activeInspection?.current?.description) && (state?.activeInspection?.current?.inspectionStatus === InspectionStatus.ACCEPTED));
  }
)

export const isCurrentInspectionDone = createSelector(
  selectInspectionsManager,
  (state?: InspectionManagementState) => {
    return (state?.activeInspection?.current?.inspectionStatus === InspectionStatus.DONE);
  }
)

export const isCurrentUserInspectionOwner = createSelector(
  selectInspectionsManager,
  getProfile,
  (inspectionState?: InspectionManagementState, profileState?: ProfileState) => {
    return profileState?.user.roles?.some(r => ((r.roleName === Roles.GOD) || (r.roleName === Roles.USER_PLANNER))) ? {success: true} : (inspectionState?.activeInspection?.current?.userId === profileState?.user.id) ? {success: true} : {}
  }
)

export const getActiveInspectionChanges = createSelector(
  selectInspectionsManager,
  (state?: InspectionManagementState) => state?.activeInspection?.changes ?? {}
)

export const hasCurrentInspectionUserAssigned = createSelector(
  selectInspectionsManager,
  (state?: InspectionManagementState) => !(state?.activeInspection?.current?.userId)
)
