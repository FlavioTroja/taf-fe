import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NAVBAR_ACTION } from "../../models/NavBar";
import { getActiveActivityChanges } from "./store/selectors/activities.selectors";

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./pages/list/activities.component"),
    data: {
      title: {
        default: "Attività"
      },
      buttons: [
        { label: "Nuovo", iconName: "add", navigate: "/activities/new" },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ]
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/edit/edit-activities.component'),
    data: {
      viewOnly: false,
      title: {
        default: "Modifica Attività",
        other: "Aggiungi Attività"
      },
      buttons: [
        {
          label: "Salva",
          iconName: "edit",
          action: NAVBAR_ACTION.ACTIVITY_SAVE,
          selectors: { disabled: getActiveActivityChanges }
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
      backAction: "/activities",
    }
  },
  {
    path: ':id/view',
    loadComponent: () => import('./pages/edit/edit-activities.component'),
    data: {
      viewOnly: true,
      title: {
        default: "Visualizza attività",
      },
      buttons: [
        { label: "Modifica", iconName: "edit", action: NAVBAR_ACTION.ACTIVITY_NAVIGATE_ON_MODIFY },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ],
      backAction: "/activities",
    }
  }
]

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export default class ActivitiesRoutingModule {
}
