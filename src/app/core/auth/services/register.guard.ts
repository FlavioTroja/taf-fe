import { inject, Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { map, Observable, tap } from "rxjs";
import { AppState } from "../../../app.config";
import * as RouterActions from "../../router/store/router.actions";
import { getAuthRegisterConfirmStatus } from "../store/auth.selectors";

@Injectable({
  providedIn: 'root'
})
export class RegisterGuard {
  store: Store<AppState> = inject(Store);

  canActivate(): Observable<boolean> {


    return this.store.select(getAuthRegisterConfirmStatus).pipe(
      map(value => !!value),
      tap(isRegistered => {
        if (!isRegistered) {
          this.store.dispatch(RouterActions.go({ path: [ "auth/register" ] }));
        }
      })
    );
  }

}
