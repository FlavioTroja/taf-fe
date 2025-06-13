import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NAVBAR_ACTION } from "../../models/NavBar";
import { getActiveWarehouseChanges } from "./store/selectors/warehouses.selectors";

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./pages/list/warehouses.component"),
    data: {
      title: {
        default: "Magazzini"
      },
      buttons: [
        // { label: "Nuovo", iconName: "add", action: NAVBAR_ACTION.USERS_CREATE },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        { label: "", iconName: "home", action: NAVBAR_ACTION.HOME }
      ]
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/edit/edit-warehouse.component'),
    data: {
      title: {
        default: "Dettaglio"
      },
      buttons: [
        { label: "Salva", iconName: "edit", action: NAVBAR_ACTION.WAREHOUSE_SAVE, selectors: { disabled: getActiveWarehouseChanges } },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ],
      backAction: "-",
    }
  },
  {
    path: ':id/products',
    loadComponent: () => import('./pages/products/products-on-warehouse.component'),
    data: {
      title: {
        default: "Nome magazzino"
      },
      buttons: [
        { label: "Nuovo Prodotto", iconName: "add", navigate: "/products/new" },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ],
      backAction: "-",
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export default class WarehouseRoutingModule {}
