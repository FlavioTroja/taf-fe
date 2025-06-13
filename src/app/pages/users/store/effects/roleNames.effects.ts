import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, concatMap, exhaustMap, filter, of } from "rxjs";
import * as UsersActions from "../actions/users.actions";
import { RolesService } from "../../services/roles.service";
import { ROUTER_NAVIGATION } from "@ngrx/router-store";
import { containsSubPath } from "../../../../../utils/routerUtils";
import { getRoleNames } from "../selectors/roleNames.selectors";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";
import { RouterRequestAction } from "@ngrx/router-store/src/actions";

@Injectable({
  providedIn: 'root'
})
export class RoleNamesEffects {

  constructor(
    private actions$: Actions,
    private rolesService: RolesService,
    private store: Store
  ) {}

  initEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ROUTER_NAVIGATION),
    filter((action: RouterRequestAction) => containsSubPath(action.payload.event.url, "users")),
    concatLatestFrom(() => [
      this.store.select(getRoleNames)
    ]),
    exhaustMap(([_, roleNames]) => {
      // reload if there are already roleNames
      if (!!roleNames && roleNames.length > 0) {
        return of(UsersActions.getRolesNamesSuccess({ roleNames }));
      }

      return this.rolesService.getRolesNames()
        .pipe(
          concatMap((roleNames) => [ UsersActions.getRolesNamesSuccess({ roleNames }) ]),
          catchError((err) => of(UsersActions.getRolesNamesFailed(err)))
        );
    })
  ));

  manageNotificationRoleNamesErrorEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[ UsersActions.getRolesNamesFailed ]),
    exhaustMap((err) => [
      UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.ERROR, message: err.error.reason?.message || "" } })
    ])
  ));

}
