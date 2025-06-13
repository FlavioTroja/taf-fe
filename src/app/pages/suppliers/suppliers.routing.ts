import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NAVBAR_ACTION } from "../../models/NavBar";
import { getActiveSupplierChanges } from "./store/selectors/suppliers.selectors";

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./pages/list/suppliers.component"),
    data: {
      title: {
        default: "Fornitori"
      },
      buttons: [
        { label: "Nuovo", iconName: "add", navigate: "/suppliers/new" },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ]
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/edit/edit-supplier.component'),
    data: {
      viewOnly: false,
      title: {
        default: "Modifica fornitore",
        other: "Aggiungi fornitore"
      },
      buttons: [
        { label: "Salva", iconName: "edit", action: NAVBAR_ACTION.SUPPLIER_SAVE, selectors: { disabled: getActiveSupplierChanges } },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ],
      backAction: "-",
    }
  },
  {
    path: ':id/view',
    loadComponent: () => import('./pages/view/view-supplier.component'),
    data: {
      title: {
        default: "Visualizza Fornitore"
      },
      buttons: [
        { label: "Modifica", iconName: "edit", action: NAVBAR_ACTION.SUPPLIER_NAVIGATE_ON_MODIFY },
      ],
      backAction: "-",
    }
  },
  // {
  //   path: ':id/view',
  //   loadComponent: () => import('./pages/edit/edit-supplier.component'),
  //   data: {
  //     viewOnly: true,
  //     title: {
  //       default: "Visualizza fornitore",
  //     },
  //     buttons: [
  //       { label: "Modifica", iconName: "edit", action: NAVBAR_ACTION.SUPPLIER_NAVIGATE_ON_MODIFY },
  //       // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
  //       // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
  //     ],
  //     backAction: "/suppliers",
  //   }
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export default class SupplierRoutingModule {}
