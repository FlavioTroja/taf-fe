import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./pages/view/view-settings.component"),
    data: {
      title: {
        default: "Impostazioni"
      },
      buttons: [
        // { label: "Nuovo", iconName: "add", navigate: "/suppliers/new" },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export default class SupplierRoutingModule {}
