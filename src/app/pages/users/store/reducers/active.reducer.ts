import { ActiveEntity } from "../../../../../global";
import { Action, createReducer, on } from "@ngrx/store";
import { User } from "../../../../models/User";
import * as UsersActions from "../actions/users.actions";

const initialState: Partial<ActiveEntity<User>> = {};

const activeUserReducer = createReducer(
  initialState,
  on(UsersActions.getUserSuccess, (state, { current }) => ({
    current: { ...current }
  })),
  on(UsersActions.userActiveChanges, (state, { changes }) => ({
    ...state,
    changes: { ...changes }
  })),
  on(UsersActions.editUserSuccess, (state, { user }) => ({
    current: { ...user }
  })),
  on(UsersActions.clearUserActive, (state) => ({
    changes: undefined,
    current: undefined
  }))
);

export function reducer(state: Partial<ActiveEntity<User>> | undefined, action: Action) {
  return activeUserReducer(state, action)
}
