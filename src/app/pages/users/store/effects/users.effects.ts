import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, concatMap, exhaustMap, map, of } from "rxjs";
import { AppState } from "../../../../app.config";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";
import { User } from "../../../../models/User";
import { UsersService } from "../../services/users.service";
import * as UsersActions from "../actions/users.actions";
import { getActiveUserChanges } from "../selectors/users.selectors";

@Injectable({
  providedIn: 'root'
})
export class UsersEffects {

  constructor(
    private actions$: Actions,
    private usersService: UsersService,
    private store: Store<AppState>
  ) {
  }

  addUserEffect$ = createEffect(() => this.actions$.pipe(
    ofType(UsersActions.addUser),
    exhaustMap(({ user }) => this.usersService.addUser(user)
      .pipe(
        concatMap((user) => [
          UsersActions.addUserSuccess({ user }),
          RouterActions.go({ path: [ `/users` ] })
        ]),
        catchError((err) => of(UsersActions.addUserFailed(err)))
      ))
  ));

  getUserEffect$ = createEffect(() => this.actions$.pipe(
    ofType(UsersActions.getUser),
    exhaustMap(({ id }) => this.usersService.getUser(id)
      .pipe(
        map((user) => UsersActions.getUserSuccess({ current: user })),
        catchError((err) => of(UsersActions.getUserFailed(err)))
      ))
  ));

  getUserFailedEffect$ = createEffect(() => this.actions$.pipe(
    ofType(UsersActions.getUserFailed),
    exhaustMap(() => [
      RouterActions.go({ path: [ "/users" ] })
    ])
  ));

  deleteUserEffect$ = createEffect(() => this.actions$.pipe(
    ofType(UsersActions.deleteUser),
    exhaustMap(({ id }) => this.usersService.deleteUser(id)
      .pipe(
        map((user) => UsersActions.loadPaginateUsers({ query: { page: 0, limit: 10 } })),
        catchError((err) => of(UsersActions.deleteUserFailed(err)))
      ))
  ));

  loadUserEffect$ = createEffect(() => this.actions$.pipe(
    ofType(UsersActions.loadPaginateUsers),
    exhaustMap(({ query }) => this.usersService.loadUsers(query)
      .pipe(
        concatMap((users) => [
          UsersActions.loadPaginateUsersSuccess({ users }),
          UsersActions.clearUserActive()
        ]),
        catchError((err) => {
          return of(UsersActions.loadPaginateUsersFailed(err));
        })
      ))
  ));

  editUserEffect$ = createEffect(() => this.actions$.pipe(
    ofType(UsersActions.editUser),
    concatLatestFrom(() => [
      this.store.select(getActiveUserChanges),
      this.store.select(selectCustomRouteParam("id"))
    ]),
    exhaustMap(([ _, changes, id ]) => {
      if ( id === 'new' ) {
        return of(UsersActions.addUser({
          user: {
            ...changes,
          }
        }));
      }
      return this.usersService.editUser(id, changes as User)
        .pipe(
          concatMap((user) => [
            UsersActions.editUserSuccess({ user }),
            RouterActions.go({ path: [ "/users" ] })
          ]),
          catchError((err) => of(UsersActions.editUserFailed(err)))
        )
    })
  ));

  manageNotificationUsersErrorEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      UsersActions.loadPaginateUsersFailed,
      UsersActions.getUserFailed,
      UsersActions.addUserFailed,
      UsersActions.editUserFailed,
      UsersActions.deleteUserFailed,
    ]),
    exhaustMap((err) => [
      UIActions.setUiNotification({
        notification: {
          type: NOTIFICATION_LISTENER_TYPE.ERROR,
          message: err.error.error.error.error || ""
        }
      })
    ])
  ));

}
