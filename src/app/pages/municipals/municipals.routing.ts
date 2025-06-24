import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NAVBAR_ACTION } from "../../models/NavBar";

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./pages/list/municipals.component"),
    data: {
      title: {
        default: "Comuni"
      },
      buttons: [
        { label: "Nuovo", iconName: "add", navigate: "/municipals/new" },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ]
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/edit/edit-municipals.component'),
    data: {
      viewOnly: false,
      title: {
        default: "Modifica Comune",
        other: "Aggiungi Comune"
      },
      buttons: [
        { label: "Salva", iconName: "edit", action: NAVBAR_ACTION.MUNICIPAL_SAVE, selectors: {} },
        // {
        //   label: "",
        //   iconName: "key",
        //   selectors: {
        //     hidden: getCurrentUser
        //   }
        // },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ],
      backAction: "/municipals",
    }
  }
]

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export default class MunicipalitiesRoutingModule {
}
