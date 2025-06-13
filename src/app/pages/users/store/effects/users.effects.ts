import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, concatMap, exhaustMap, map, of } from "rxjs";
import * as RouterActions from "../../../../core/router/store/router.actions";
import * as UsersActions from "../actions/users.actions";
import { UsersService } from "../../services/users.service";
import { getActiveUserChanges, getNewPassword } from "../selectors/users.selectors";
import { Role, User } from "../../../../models/User";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";

@Injectable({
  providedIn: 'root'
})
export class UsersEffects {

  constructor(
    private actions$: Actions,
    private usersService: UsersService,
    private store: Store
  ) {}

  addUserEffect$ = createEffect(() => this.actions$.pipe(
    ofType(UsersActions.addUser),
    exhaustMap(({ user }) => this.usersService.addUser(user)
      .pipe(
        concatMap((user) => [
          UsersActions.addUserSuccess({ user }),
          RouterActions.go({ path: [`/users`] })
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
      RouterActions.go({ path: ["/users"] })
    ])
  ));

  deleteUserEffect$ = createEffect(() => this.actions$.pipe(
    ofType(UsersActions.deleteUser),
    exhaustMap(({ id  }) => this.usersService.deleteUser(id)
      .pipe(
        map((user) => UsersActions.loadUsers({ query: { query: {}, options: { limit: 10, page: 1 } } })),
        catchError((err) => of(UsersActions.deleteUserFailed(err)))
      ))
  ));

  loadUserEffect$ = createEffect(() => this.actions$.pipe(
    ofType(UsersActions.loadUsers),
    exhaustMap(({ query }) => this.usersService.loadUsers(query)
      .pipe(
        concatMap((users) => [
          UsersActions.loadUsersSuccess({ users }),
          UsersActions.clearUserActive()
        ]),
        catchError((err) => {
          return of(UsersActions.loadUsersFailed(err));
        })
      ))
  ));

  editUserEffect$ = createEffect(() => this.actions$.pipe(
    ofType(UsersActions.editUser),
    concatLatestFrom(() => [
      this.store.select(getActiveUserChanges)
    ]),
    exhaustMap(([_, changes]) => {
      if(isNaN(changes.id!)) {
        return of(UsersActions.addUser({
          user: {
            ...changes,
            roles: (changes?.roles?.map((role) => ({ ...role, id: undefined })) ?? []) as Role[],
          }
        }));
      }
      return this.usersService.editUser(changes?.id!, changes as User)
        .pipe(
          concatMap((user) => [
            UsersActions.editUserSuccess({ user }),
            RouterActions.go({ path: ["/users"] })
          ]),
          catchError((err) => of(UsersActions.editUserFailed(err)))
        )
    })
  ));

  changeCurrentUserPasswordEffect$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UsersActions.changeUserPassword),
      concatLatestFrom(() => [
        this.store.select(getNewPassword)
      ]),
      exhaustMap(([{ id }, newPassword]) => {
        return this.usersService.changeUserPassword( id, { newPassword: (newPassword as string) })
          .pipe(
            concatMap(() => [
              UIActions.setUiNotification({
                notification: {
                  type: NOTIFICATION_LISTENER_TYPE.SUCCESS,
                  message: "Password modificata con successo"
                }
              }),
              UsersActions.changeUserPasswordSuccess()
            ]),
            catchError((err) => of(UsersActions.changeUserPasswordFailed(err)))
          )
      })
    )
  });

  manageNotificationUsersErrorEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      UsersActions.loadUsersFailed,
      UsersActions.getUserFailed,
      UsersActions.addUserFailed,
      UsersActions.editUserFailed,
      UsersActions.deleteUserFailed,
    ]),
    exhaustMap((err) => [
      UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.ERROR, message: err.error.reason?.message || "" } })
    ])
  ));

}
