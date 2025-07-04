import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NAVBAR_ACTION } from "../../models/NavBar";
import { getActiveEventChanges } from "./store/selectors/events.selectors";

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./pages/list/events.component"),
    data: {
      title: {
        default: "Eventi"
      },
      buttons: [
        { label: "Nuovo", iconName: "add", navigate: "/events/new" },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ]
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/edit/edit-events.component'),
    data: {
      viewOnly: false,
      title: {
        default: "Modifica Evento",
        other: "Aggiungi Evento"
      },
      buttons: [
        {
          label: "Salva",
          iconName: "edit",
          action: NAVBAR_ACTION.EVENT_SAVE,
          selectors: { disabled: getActiveEventChanges }
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
      backAction: "/events",
    }
  },
  {
    path: ':id/view',
    loadComponent: () => import('./pages/edit/edit-events.component'),
    data: {
      viewOnly: true,
      title: {
        default: "Visualizza Eventi",
      },
      buttons: [
        { label: "Modifica", iconName: "edit", action: NAVBAR_ACTION.EVENTS_NAVIGATE_ON_MODIFY },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ],
      backAction: "/events",
    }
  }
]

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export default class NewsRoutingModule {
}
