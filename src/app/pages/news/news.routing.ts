import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NAVBAR_ACTION } from "../../models/NavBar";
import { getActiveNewsChanges } from "./store/selectors/news.selectors";

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./pages/list/news.component"),
    data: {
      title: {
        default: "News"
      },
      buttons: [
        { label: "Nuovo", iconName: "add", navigate: "/news/new" },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ]
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/edit/edit-news.component'),
    data: {
      viewOnly: false,
      title: {
        default: "Modifica News",
        other: "Aggiungi News"
      },
      buttons: [
        {
          label: "Salva",
          iconName: "edit",
          action: NAVBAR_ACTION.NEWS_SAVE,
          selectors: { disabled: getActiveNewsChanges }
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
      backAction: "/news",
    }
  }
]

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export default class NewsRoutingModule {
}
