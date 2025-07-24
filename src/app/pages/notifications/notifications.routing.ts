import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NAVBAR_ACTION } from "../../models/NavBar";
import { getActiveNotificationChanges } from "./store/selectors/notification.selectors";

export const routes: Routes = [
  {
    path: 'sent',
    loadComponent: () => import("./pages/list/notifications.component"),
    data: {
      title: {
        default: "Notifiche"
      },
      buttons: [
        { label: "Nuovo", iconName: "add", navigate: "/notifications/new" },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ]
    }
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/edit/edit-notification.component'),
    data: {
      viewOnly: false,
      title: {
        default: "Modifica Notifica",
        other: "Aggiungi Notifica"
      },
      buttons: [
        {
          label: "Salva",
          iconName: "edit",
          action: NAVBAR_ACTION.NOTIFICATION_SAVE,
          selectors: { disabled: getActiveNotificationChanges }
        },
        // {
        //   label: "",
        //   iconName: "key",
        //   selectors: {
        //     hidden: getCurrentUser
        //   }
        // },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ],
      backAction: "/notifications/sent",
    }
  },
  {
    path: 'sent/:id',
    loadComponent: () => import('./pages/edit/edit-notification.component'),
    data: {
      viewOnly: false,
      title: {
        default: "Modifica Notifica",
        other: "Aggiungi Notifica"
      },
      buttons: [
        {
          label: "Salva",
          iconName: "edit",
          action: NAVBAR_ACTION.NOTIFICATION_SAVE,
          selectors: { disabled: getActiveNotificationChanges }
        },
        // {
        //   label: "",
        //   iconName: "key",
        //   selectors: {
        //     hidden: getCurrentUser
        //   }
        // },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ],
      backAction: "/notifications/sent",
    }
  },
  {
    path: 'sent/:id/view',
    loadComponent: () => import('./pages/edit/edit-notification.component'),
    data: {
      viewOnly: true,
      title: {
        default: "Visualizza notifiche",
      },
      buttons: [
        { label: "Modifica", iconName: "edit", action: NAVBAR_ACTION.SENT_NOTIFICATIONS_NAVIGATE_ON_MODIFY },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ],
      backAction: "/notifications/sent",
    }
  },
  {
    path: 'received',
    loadComponent: () => import("./pages/list/notifications.component"),
    data: {
      title: {
        default: "Notifiche"
      },
      buttons: [
        { label: "Nuovo", iconName: "add", navigate: "/notifications/new" },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ]
    }
  },
  {
    path: 'received/:id/view',
    loadComponent: () => import('./pages/edit/edit-notification.component'),
    data: {
      viewOnly: true,
      title: {
        default: "Visualizza notifiche",
      },
      buttons: [
        { label: "Modifica", iconName: "edit", action: NAVBAR_ACTION.RECEIVED_NOTIFICATIONS_NAVIGATE_ON_MODIFY },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ],
      backAction: "/notifications/received",
    }
  }
]

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export default class NewsRoutingModule {
}
