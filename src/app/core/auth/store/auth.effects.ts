import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from "@ngrx/effects";
import * as AuthActions from "./auth.actions";
import { catchError, exhaustMap, filter, map, of, tap } from "rxjs";
import { AuthService } from "../services/auth.service";
import * as ProfileActions from "../../profile/store/profile.actions";
import * as RouterActions from "../../router/store/router.actions";

@Injectable({
  providedIn: 'root'
})
export class AuthEffects  {

  initEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ROOT_EFFECTS_INIT),
    map(() => this.authService.getAccessToken()),
    filter(accessToken => !!accessToken),
    exhaustMap((accessToken) => [
      AuthActions.saveAuth({ auth: { token: accessToken ?? undefined } }),
      ProfileActions.loadProfile()
    ])
  ));

  loginEffect$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.login),
    exhaustMap(({ usernameOrEmail, password }) => this.authService.login({usernameOrEmail, password})
      .pipe(
        map(auth => AuthActions.loginSuccess({ auth: auth })),
        catchError((err) => {
          return of(AuthActions.loginFailed(err))
        })
      ))
  ));

  loginSuccessEffect$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loginSuccess),
    tap(({ auth }) => this.authService.saveAuth(auth)),
    exhaustMap(() => [
      ProfileActions.loadProfile(),
      RouterActions.go({ path: ["home"] })
    ])
  ))

  logoutEffect$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.logout),
    tap(() => this.authService.cleanAuth()),
    exhaustMap(() => [
      RouterActions.go({ path: ["auth/login"] }),
      AuthActions.logoutSuccess()
    ])
  ))
  constructor(private actions$: Actions,
              private authService: AuthService) {}
}
