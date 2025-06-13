import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("../drafts/pages/list/drafts.component"),
    data: {
      title: {
        default: "Lavori Conclusi"
      },
      buttons: []
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export default class TasksRoutingModule {}
