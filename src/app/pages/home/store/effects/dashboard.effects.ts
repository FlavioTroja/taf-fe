import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { exhaustMap } from "rxjs";
import * as DashboardActions from "../actions/dashboard.actions";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";


@Injectable({
  providedIn: 'root'
})
export class DashboardEffect {

  manageNotificationDashboardEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      DashboardActions.getDashboardInvoiceStatisticsFailed,
      DashboardActions.getDashboardWarehouseStatisticsFailed,
      DashboardActions.getDashboardWarehouseLastStatisticFailed,
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

  constructor(private actions$: Actions) {
  }
}
