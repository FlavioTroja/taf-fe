import { inject, Injectable } from "@angular/core";
import { map, Observable, tap } from "rxjs";
import { AppState } from "../../../app.config";
import { Store } from "@ngrx/store";
import { getAccessToken } from "../store/auth.selectors";
import * as RouterActions from "../../router/store/router.actions";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  store: Store<AppState> = inject(Store);
  canActivate(): Observable<boolean> {


    return this.store.select(getAccessToken).pipe(
      map(value => !!value),
      tap(isLogged => {
        if(!isLogged) {
          this.store.dispatch(RouterActions.go({ path: ["auth/login"] }));
        }
      })
    );
  }

}
