import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NAVBAR_ACTION } from "../../models/NavBar";

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./pages/list/municipalities.component"),
    data: {
      title: {
        default: "Comuni"
      },
      buttons: [
        { label: "Nuovo", iconName: "add", navigate: "/municipalities/new" },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ]
    }
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/add/add-municipalities.component'),
    data: {
      title: {
        default: "Aggiungi Comune"
      },
      buttons: [
        { label: "Salva", iconName: "edit", action: NAVBAR_ACTION.USER_SAVE, selectors: {} }
      ],
      backAction: "/municipalities"
    },
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/edit/edit-municipalities.component'),
    data: {
      viewOnly: false,
      title: {
        default: "Modifica Comune",
      },
      buttons: [
        { label: "Salva", iconName: "edit", action: NAVBAR_ACTION.USER_SAVE, selectors: {} },
        // {
        //   label: "",
        //   iconName: "key",
        //   selectors: {
        //     hidden: getCurrentUser
        //   }
        // },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ],
      backAction: "/municipalities",
    }
  }
]

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export default class MunicipalitiesRoutingModule {
}
