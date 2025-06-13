import { Action, createReducer, on } from "@ngrx/store";
import * as UsersActions from "../actions/users.actions";
import { PaginateDatasource } from "../../../../models/Table";
import { User } from "../../../../models/User";


const initialState: Partial<PaginateDatasource<User>> = {}

const usersReducer = createReducer(
  initialState,
  on(UsersActions.loadUsersSuccess, (state, { users }) => ({
    ...users
  }))
);

export function reducer(state: Partial<PaginateDatasource<User>> | undefined, action: Action) {
  return usersReducer(state, action)
}
