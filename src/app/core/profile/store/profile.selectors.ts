import { createSelector } from "@ngrx/store";
import { AppState } from "../../../app.config";
import { Roles } from "../../../models/User";
import { ProfileState } from "./profile.reducer";

export const getProfile = (state: AppState | any) => state.profile;
// export const getProfile = createFeatureSelector<AppState, ProfileState>("profile")

export const getProfileUser = createSelector(
  getProfile,
  (state: ProfileState) => state.user,
);

export const getDomainImages = createSelector(
  getProfile,
  (state: ProfileState) => state?.domainImages
)

export const getProfileUsername = createSelector(
  getProfile,
  (state: ProfileState) => state.user.name
);

export const getProfileAvatarUrl = createSelector(
  getProfile,
  (state: ProfileState) => state.user?.photo
);

export const getProfileUserRoleNames = createSelector(
  getProfile,
  (state: ProfileState) => state.user?.roles?.map(r => r === Roles.ROLE_USER ? 'USER' : 'ADMIN') || []
);

export const getProfileMunicipalityId = createSelector(
  getProfile,
  (state: ProfileState) => state?.municipalityId
)

export const disabledByRolesSelector = (disabledRoles: Roles[]) =>
  createSelector(
    getProfile,
    (state?: ProfileState) => {
      /*      if (state?.user.roles?.some(role => role)) {
              return true;
            }
            return !state?.user.roles?.some(
              role => disabledRoles.includes(role.roleName) && role.isActive
            );*/
      return true
    }
  );

