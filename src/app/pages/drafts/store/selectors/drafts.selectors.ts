import { createSelector } from "@ngrx/store";
import { DraftManagementState, selectDraftsManager } from "../reducers";
import { SetupStatus } from "../../../../models/Setup";

export const getSetupChanges = createSelector(
  selectDraftsManager,
  (state?: DraftManagementState) =>  state?.activeSetup?.changes ?? {}
)

export const getCurrentSetup = createSelector(
  selectDraftsManager,
  (state?: DraftManagementState) => state?.activeSetup?.current
)

export const getSetupsPaginate = createSelector(
  selectDraftsManager,
  (state?: DraftManagementState) => state?.setups
)

export const getAllSetups = createSelector(
  selectDraftsManager,
  (state?: DraftManagementState) => state?.setups?.docs
)

export const getSetupFilter = createSelector(
  selectDraftsManager,
  (state?: DraftManagementState) => state?.setupFilters
);

export const getCurrentCost = createSelector(
  selectDraftsManager,
  (state?: DraftManagementState) => state?.activeCost?.current || {}
);

export const getCostsChanges = createSelector(
  selectDraftsManager,
  (state?: DraftManagementState) => state?.activeCost?.changes || []
);

export const isCurrenDraftConfirmed = createSelector(
  selectDraftsManager,
  (state?: DraftManagementState) => state?.activeSetup?.current?.setupStatus === SetupStatus.CONFIRMED
);

export const isCurrenDraftHidden = createSelector(
  selectDraftsManager,
  (state?: DraftManagementState) => (
    (state?.activeSetup?.current?.setupStatus === SetupStatus.CANCELED)
    || (state?.activeSetup?.current?.setupStatus === SetupStatus.CONFIRMED)
    || (state?.activeSetup?.current?.setupStatus === SetupStatus.DONE))
    ? {} : { success: true }
);

export const isCurrenDraftEditDisabled = createSelector(
  selectDraftsManager,
  (state?: DraftManagementState) => state?.activeSetup?.current?.setupStatus !== SetupStatus.DRAFT ? {} : { success: true }
);

/**TODO: Create mixed selector to handle save button disabled state due to SetupStatus and changes */
// export const canSaveCurrentDraft = createSelector(
//   selectDraftsManager,
//   (state?: DraftManagementState) => {
//     console.log('grgr', Object.keys(state?.activeSetup?.changes!)?.length > 0)
//     if (state?.activeSetup?.current?.setupStatus === SetupStatus.CONFIRMED) {
//       console.log('ee')
//       return true;
//     }
//     console.log('dd')
//     return !(Object.keys(state?.activeSetup?.changes!)?.length > 0) ?? true;
//   }
// );
