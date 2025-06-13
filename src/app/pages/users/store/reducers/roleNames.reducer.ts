import { Action, createReducer, on } from "@ngrx/store";
import * as UsersActions from "../actions/users.actions";
import { RoleName } from "../../../../models/User";

const initialState: RoleName[] = [];

const roleNamesReducer = createReducer(
  initialState,
  on(UsersActions.getRolesNamesSuccess, (state, {roleNames}) => roleNames)
);

export function reducer(state: RoleName[] | undefined, action: Action) {
  return roleNamesReducer(state, action)
}
