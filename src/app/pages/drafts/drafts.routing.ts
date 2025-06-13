import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NAVBAR_ACTION } from "../../models/NavBar";
import {
  isCurrenDraftEditDisabled,
  isCurrenDraftConfirmed,
  isCurrenDraftHidden
} from "./store/selectors/drafts.selectors";

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./pages/list/drafts.component"),
    data: {
      title: {
        default: "Schede tecniche"
      },
      buttons: []
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/edit/edit-draft.component'),
    data: {
      viewOnly: false,
      title: {
        default: "Modifica scheda tecniche",
        other: "Aggiungi scheda tecniche"
      },
      buttons: [
        { label: "Salva", iconName: "check", action: NAVBAR_ACTION.DRAFT_SETUP_EDIT, selectors: { disabled: isCurrenDraftConfirmed } },
      ],
      backAction: "-",
    }
  },
  {
    path: ':id/view',
    loadComponent: () => import('./pages/view/view-draft.component'),
    data: {
      title: {
        default: "Visualizza schede tecniche"
      },
      buttons: [
        { label: "Modifica", iconName: "edit", action: NAVBAR_ACTION.DRAFT_NAVIGATE_ON_MODIFY, selectors: { disabled: isCurrenDraftEditDisabled, hidden: isCurrenDraftHidden } },
      ],
      backAction: "-",
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export default class TaskStepRoutingModule {}
