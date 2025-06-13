import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NAVBAR_ACTION } from "../../models/NavBar";
import { getActiveCustomerChanges } from "./store/selectors/customers.selectors";

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./pages/list/customers.component"),
    data: {
      title: {
        default: "Clienti"
      },
      buttons: [
        { label: "Nuovo", iconName: "add", navigate: "/customers/new" },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ]
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/edit/edit-customer.component'),
    data: {
      viewOnly: false,
      title: {
        default: "Modifica cliente",
        other: "Aggiungi cliente"
      },
      buttons: [
        { label: "Salva", iconName: "edit", action: NAVBAR_ACTION.CUSTOMER_SAVE, selectors: { disabled: getActiveCustomerChanges } },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ],
      backAction: "-",
    }
  },
  {
    path: ':id/view',
    loadComponent: () => import('./pages/view/view-customer.component'),
    data: {
      title: {
        default: "Visualizza cliente",
      },
      buttons: [
        { label: "Modifica", iconName: "edit", action: NAVBAR_ACTION.CUSTOMER_NAVIGATE_ON_MODIFY },
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
export default class CustomersRoutingModule {}
