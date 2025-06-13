import { createSelector } from "@ngrx/store";
import { ProfileState } from "./profile.reducer";
import { AppState } from "../../../app.config";
import { Roles } from "../../../models/User";

export const getProfile = (state: AppState | any) => state.profile;
// export const getProfile = createFeatureSelector<AppState, ProfileState>("profile")

export const getProfileUser = createSelector(
  getProfile,
  (state: ProfileState) => state.user,
);

export const getProfileUsername = createSelector(
  getProfile,
  (state: ProfileState) => state.user.username
);

export const getProfileAvatarUrl = createSelector(
  getProfile,
  (state: ProfileState) => state.user?.avatarUrl
);

export const getProfileUserRoleNames = createSelector(
  getProfile,
  (state: ProfileState) => state.user?.roles?.map(r => r.roleName) || []
);

export const disabledByRolesSelector = (disabledRoles: Roles[]) =>
  createSelector(
    getProfile,
    (state?: ProfileState) => {
      if (state?.user.roles?.some(role => role.roleName === Roles.OVERZOOM)) {
        return true;
      }
      return !state?.user.roles?.some(
        role => disabledRoles.includes(role.roleName) && role.isActive
      );
    }
  );

