import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { getActiveBatchCargoItems } from "./store/selectors/cargos.selectors";
import { NAVBAR_ACTION } from "../../models/NavBar";

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./pages/list/cargos.component"),
    data: {
      title: {
        default: "Movimentazioni"
      },
      buttons: [
        { label: "In Blocco", iconName: "quick_reorder", navigate: "/cargos/new-bulk" },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ]
    }
  },
  {
    path: 'bulk',
    loadComponent: () => import("./pages/bulk/create-bulk-cargos.component"),
    data: {
      title: {
        default: "Movimentazioni in Blocco"
      },
      buttons: [
        { label: "Esegui", iconName: "done", action: NAVBAR_ACTION.CARGO_CREATE_BLOCK, selectors: { disabled: getActiveBatchCargoItems }},
      ],
      backAction: "-",
    }
  },
  {
    path: 'new-bulk',
    loadComponent: () => import("./pages/new-bulk/bulk-cargos.component"),
    data: {
      title: {
        default: "Movimentazioni in Blocco"
      },
      buttons: [
        { label: "Esegui", iconName: "done", action: NAVBAR_ACTION.CARGO_CREATE_BLOCK, selectors: { disabled: getActiveBatchCargoItems }},
      ],
      backAction: "-",
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export default class CargosRoutingModule {}
