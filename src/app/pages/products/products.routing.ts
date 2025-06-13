import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NAVBAR_ACTION } from "../../models/NavBar";
import {
  getActiveProductChanges,
  getContentOfProductDeleteModel
} from "./store/selectors/products.selectors";
const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./pages/list/products.component"),
    data: {
      title: {
        default: "Prodotti"
      },
      buttons: [
        { label: "Nuovo", iconName: "add", navigate: "/products/new" },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ]
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/edit/edit-product.component'),
    data: {
      title: {
        default: "Modifica prodotto",
        other: "Aggiungi prodotto"
      },
      buttons: [
        { label: "Salva", iconName: "edit", action: NAVBAR_ACTION.PRODUCT_SAVE, selectors: { disabled: getActiveProductChanges } },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ],
      backAction: "-",
    }
  },
  {
    path: ':id/view',
    loadComponent: () => import('./pages/view/view-product.component'),
    data: {
      title: {
        default: "Dettagli Prodotto"
      },
      buttons: [
        { label: "Modifica", iconName: "edit", action: NAVBAR_ACTION.PRODUCT_NAVIGATE_ON_MODIFY },
        { label: "", iconName: "open_with", action: NAVBAR_ACTION.PRODUCT_NAVIGATE_ON_MOVE },
        {
          label: "",
          iconName: "delete",
          dialog: {
            title: "Conferma Rimozione",
            content: getContentOfProductDeleteModel,
            action: NAVBAR_ACTION.PRODUCT_DELETE
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
export default class ProductRoutingModule {}
