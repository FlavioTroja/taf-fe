import { inject, Injectable, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Store } from "@ngrx/store";
import { AppState } from "../../../app.config";
import { NAVBAR_ACTION } from "../../../models/NavBar";
import { editMunicipal } from "../../../pages/municipals/store/actions/municipals.actions";
import * as UserActions from "../../../pages/users/store/actions/users.actions";
import * as RouterActions from "../../router/store/router.actions";
import { selectCustomRouteParam } from "../../router/store/router.selectors";

@Injectable({
  providedIn: 'root'
})
export class NavbuttonService {
  store: Store<AppState> = inject(Store);
  id = toSignal(this.store.select(selectCustomRouteParam("id")));
  url = signal(document.location.href);

  navbarButtonActions = [
    {
      actionName: NAVBAR_ACTION.USER_SAVE,
      callback: () => this.store.dispatch(UserActions.editUser())
    },
    {
      actionName: NAVBAR_ACTION.MUNICIPAL_SAVE,
      callback: () => this.store.dispatch(editMunicipal())
    },
    {
      actionName: NAVBAR_ACTION.USER_NAVIGATE_ON_MODIFY,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `users/${ this.id() }` ] }))
    },
    {
      actionName: NAVBAR_ACTION.HOME,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `/` ] }))
    },
  ];

  dispatchAction(action: string) {
    return this.navbarButtonActions.find(({ actionName }) => actionName === action)?.callback();
  }


}
