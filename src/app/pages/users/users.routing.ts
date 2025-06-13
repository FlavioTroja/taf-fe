import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NAVBAR_ACTION } from "../../models/NavBar";
import { getActiveUserChanges } from "./store/selectors/users.selectors";

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./pages/list/users.component"),
    data: {
      title: {
        default: "Utenti"
      },
      buttons: [
        { label: "Nuovo", iconName: "add", navigate: "/users/new" },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ]
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/edit/edit-user.component'),
    data: {
      viewOnly: false,
      title: {
        default: "Modifica utente",
        other: "Aggiungi utente"
      },
      buttons: [
        { label: "Salva", iconName: "edit", action: NAVBAR_ACTION.USER_SAVE, selectors: { disabled: getActiveUserChanges } },
        // {
        //   label: "",
        //   iconName: "key",
        //   selectors: {
        //     hidden: getCurrentUser
        //   }
        // },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ],
      backAction: "/users",
    }
  },
  {
    path: ':id/view',
    loadComponent: () => import('./pages/edit/edit-user.component'),
    data: {
      viewOnly: true,
      title: {
        default: "Visualizza utente",
      },
      buttons: [
        { label: "Modifica", iconName: "edit", action: NAVBAR_ACTION.USER_NAVIGATE_ON_MODIFY },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ],
      backAction: "/users",
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export default class UsersRoutingModule {}
