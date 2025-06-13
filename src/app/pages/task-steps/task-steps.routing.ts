import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./pages/list/task-steps.component"),
    data: {
      title: {
        default: "Il mio reparto"
      },
      buttons: []
    }
  },
  {
    path: ':id/view',
    loadComponent: () => import("./pages/view/view-task-steps.component"),
    data: {
      title: {
        default: "Scheda tecnica",
      },
      backAction: "/task-steps",
      buttons: []
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export default class TaskStepRoutingModule {}
