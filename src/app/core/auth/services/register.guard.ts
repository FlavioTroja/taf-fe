import { inject, Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { map, Observable } from "rxjs";
import { AppState } from "../../../app.config";
import { go } from "../../router/store/router.actions";
import { getProfileUser } from "../../profile/store/profile.selectors";

@Injectable({
  providedIn: 'root'
})
export class RegisterGuard {
  store: Store<AppState> = inject(Store);

  canActivate(): Observable<void> {


    return this.store.select(getProfileUser)
      .pipe(
        map((user) => {
          if ( user.id ) {
            this.store.dispatch(go({ path: [ "/home" ] }))
          }
        })
      )
  }

}
