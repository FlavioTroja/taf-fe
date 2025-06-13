import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as RouterActions from "./router.actions";
import { Router } from "@angular/router";
import { mergeMap, tap } from "rxjs";
import { Location } from "@angular/common";
import * as AuthActions from "../../auth/store/auth.actions";

// dispatch false --> serve ad indicare che l'effect non ritorna un azione

@Injectable({
  providedIn: 'root'
})
export class RouterEffects {
  // routerNavigated$ = createEffect(() => this.actions$.pipe(
  //   ofType(ROUTER_NAVIGATED),
  //   exhaustMap(action => [
  //     UiActions.uiNavbarLoadSection({ page: { path: (action as unknown as { payload: any }).payload.event.url } })
  //   ])
  // ));

  unauthorizedToken =  createEffect(() => this.actions$.pipe(
    ofType(AuthActions.unauthorizedToken),
    mergeMap(action => [
      // UiActions.uiNavbarLoadSection({ page: { path: action.path[0] } })
      AuthActions.logout()
    ])
  ));

  goEffect$ = createEffect(() => this.actions$.pipe(
    ofType(RouterActions.go),
    tap(({ path, extras }) => {
      this.router.navigate(path, extras);
    })
  ), { dispatch: false });

  backEffect$ = createEffect(() => this.actions$.pipe(
    ofType(RouterActions.back),
    tap(({ path }) => {
      path ? this.router.navigate(path) : this.location.back();
    })
  ), { dispatch: false });

  forwardEffect$ = createEffect(() => this.actions$.pipe(
    ofType(RouterActions.forward),
    tap(action => {
      this.location.forward();
    })
  ), { dispatch: false });

  constructor(private actions$: Actions,
              private router: Router,
              private location: Location) {}
}
