import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NAVBAR_ACTION } from "../../models/NavBar";
import {
  disabledCategoryDeleteFromView, getActiveCategoryChanges,
  getContentOfCategoryDeleteModel
} from "./store/selectors/categories.selectors";

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./pages/list/categories.component"),
    data: {
      title: {
        default: "Categorie"
      },
      buttons: [
        { label: "Nuovo", iconName: "add", navigate: "/categories/new" },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ]
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/edit/edit-category.component'),
    data: {
      viewOnly: false,
      title: {
        default: "Modifica categoria",
        other: "Aggiungi categoria"
      },
      buttons: [
        {
          label: "Salva",
          iconName: "edit",
          action: NAVBAR_ACTION.CATEGORY_SAVE,
          selectors: {
            disabled: getActiveCategoryChanges
          }
        },
        {
          label: "",
          iconName: "delete",
          dialog: {
            title: "Conferma Rimozione",
            content: getContentOfCategoryDeleteModel,
            action: NAVBAR_ACTION.CATEGORY_DELETE
          },
          selectors: {
            disabled: disabledCategoryDeleteFromView
          }
        }
      ],
      backAction: "/categories",
    }
  },
  {
    path: ':id/view',
    loadComponent: () => import('./pages/edit/edit-category.component'),
    data: {
      viewOnly: true,
      title: {
        default: "Visualizza categoria",
      },
      buttons: [
        { label: "Modifica", iconName: "edit", action: NAVBAR_ACTION.SUPPLIER_SAVE },
        // { label: "", iconName: "search", action: NAVBAR_ACTION.USERS_EDIT },
        // { label: "", iconName: "home", action: NAVBAR_ACTION.USERS_DELETE }
      ],
      backAction: "/categories",
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export default class CategoriesRouting {}
