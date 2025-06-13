import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NAVBAR_ACTION } from "../../models/NavBar";
import {getActiveResourceChanges, getContentOfResourceDeleteModel} from "./store/selectors/resources.selector";

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./pages/list/resources.component"),
    data: {
      title: {
        default: "Risorse"
      },
      buttons: [
        { label: "Nuovo", iconName: "add", navigate: "/resources/new" },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ]
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/edit/edit-resource.component'),
    data: {
      title: {
        default: "Modifica Risorsa",
        other: "Aggiungi Risorsa"
      },
      buttons: [
        { label: "Salva", iconName: "edit", action: NAVBAR_ACTION.RESOURCE_SAVE, selectors: { disabled: getActiveResourceChanges } },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ],
      backAction: "-",
    }
  },
  {
    path: ':id/view',
    loadComponent: () => import('./pages/view/view-resource.component'),
    data: {
      title: {
        default: "Dettagli Risorsa"
      },
      buttons: [
        { label: "Modifica", iconName: "edit", action: NAVBAR_ACTION.RESOURCE_NAVIGATE_ON_MODIFY },
        {
          label: "",
          iconName: "delete",
          dialog: {
            title: "Conferma Rimozione",
            content: getContentOfResourceDeleteModel,
            action: NAVBAR_ACTION.RESOURCE_DELETE
          }
        }
      ],
      backAction: "-",
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export default class ResourceRoutingModule {}
