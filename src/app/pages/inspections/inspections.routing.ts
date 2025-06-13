import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NAVBAR_ACTION } from "../../models/NavBar";
import {
  getFormChanges,
  isCurrentInspectionAccepted,
  isCurrentInspectionDone, isCurrentUserInspectionOwner
} from "./store/selectors/inspections.selectors";

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./pages/calendar/inspections.component"),
    data: {
      title: {
        default: "Sopralluoghi"
      },
      buttons: [
        { label: "Nuovo", iconName: "add", navigate: "/inspections/new", roleSelector: 'inspections.selective-list.nav-button-new' },
      ]
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/edit/edit-inspection.component'),
    data: {
      viewOnly: false,
      title: {
        default: "Modifica Sopralluogo",
        other: "Aggiungi Sopralluogo"
      },
      buttons: [
        {
          label: "Salva",
          iconName: "check",
          action: NAVBAR_ACTION.INSPECTION_SAVE,
          selectors: { disabled: getFormChanges }
        },
      ],
      backAction: "-",
    }
  },
  {
    path: ':id/view',
    loadComponent: () => import('./pages/view/view-inspection.component'),
    data: {
      title: {
        default: "Visualizza Sopralluogo"
      },
      buttons: [
        {
          label: "Modifica",
          iconName: "edit",
          action: NAVBAR_ACTION.INSPECTION_NAVIGATE_ON_MODIFY,
          selectors: { disabled: isCurrentInspectionDone, hidden: isCurrentUserInspectionOwner }
        },
        {
          label: "",
          iconName: "done_all",
          action: NAVBAR_ACTION.INSPECTION_COMPLETE,
          selectors: { disabled: isCurrentInspectionAccepted, hidden: isCurrentUserInspectionOwner },
          roleSelector: 'inspections.edit-inspections.complete-inspection-button'
        },
      ],
      backAction: "-",
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export default class InspectionRoutingModule {}
