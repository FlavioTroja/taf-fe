import { inject, Injectable, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Store } from "@ngrx/store";
import { AppState } from "../../../app.config";
import { NAVBAR_ACTION } from "../../../models/NavBar";
import { editActivity } from "../../../pages/activities/store/actions/activities.actions";
import { editEvent } from "../../../pages/events/store/actions/events.actions";
import { editMunicipal } from "../../../pages/municipals/store/actions/municipals.actions";
import { editNews } from "../../../pages/news/store/actions/news.actions";
import { editNotification } from "../../../pages/notifications/store/actions/notification.actions";
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
      actionName: NAVBAR_ACTION.ACTIVITY_SAVE,
      callback: () => this.store.dispatch(editActivity())
    },
    {
      actionName: NAVBAR_ACTION.NEWS_SAVE,
      callback: () => this.store.dispatch(editNews())
    },
    {
      actionName: NAVBAR_ACTION.EVENT_SAVE,
      callback: () => this.store.dispatch(editEvent())
    },
    {
      actionName: NAVBAR_ACTION.NOTIFICATION_SAVE,
      callback: () => this.store.dispatch(editNotification())
    },
    {
      actionName: NAVBAR_ACTION.USER_NAVIGATE_ON_MODIFY,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `users/${ this.id() }` ] }))
    },
    {
      actionName: NAVBAR_ACTION.MUNICIPAL_NAVIGATE_ON_MODIFY,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `municipals/${ this.id() }` ] }))
    },
    {
      actionName: NAVBAR_ACTION.ACTIVITY_NAVIGATE_ON_MODIFY,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `activities/${ this.id() }` ] }))
    },
    {
      actionName: NAVBAR_ACTION.NEWS_NAVIGATE_ON_MODIFY,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `news/${ this.id() }` ] }))
    },
    {
      actionName: NAVBAR_ACTION.EVENTS_NAVIGATE_ON_MODIFY,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `events/${ this.id() }` ] }))
    },
    {
      actionName: NAVBAR_ACTION.SENT_NOTIFICATIONS_NAVIGATE_ON_MODIFY,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `notifications/sent/${ this.id() }` ] }))
    },
    {
      actionName: NAVBAR_ACTION.RECEIVED_NOTIFICATIONS_NAVIGATE_ON_MODIFY,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `notifications/received/${ this.id() }` ] }))
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
