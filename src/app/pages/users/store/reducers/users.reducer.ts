import { Action, createReducer, on } from "@ngrx/store";
import { PaginateDatasource } from "../../../../models/Table";
import { User } from "../../../../models/User";
import * as UsersActions from "../actions/users.actions";


const initialState: Partial<PaginateDatasource<User>> = {}

const usersReducer = createReducer(
  initialState,
  on(UsersActions.loadPaginateUsersSuccess, (state, { users }) => ({
    ...users
  }))
);

export function reducer(state: Partial<PaginateDatasource<User>> | undefined, action: Action) {
  return usersReducer(state, action)
}
