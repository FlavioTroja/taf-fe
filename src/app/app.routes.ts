import { Routes } from '@angular/router';
import { AuthGuard } from "./core/auth/services/auth.guard";
import NotFoundComponent from "./components/not-found/not-found.component";
import { provideState } from "@ngrx/store";
import { reducers as dashboardManagementReducers } from "./pages/home/store/reducers";
import { reducers as warehouseManagementReducers } from "./pages/warehouses/store/reducers";
import { reducers as productManagementReducers } from "./pages/products/store/reducers";
import { reducers as categoryManagementReducers } from "./pages/categories/store/reducers";
import { reducers as cargoManagementReducers } from "./pages/cargos/store/reducers";
import { reducers as supplierManagementReducers } from "./pages/suppliers/store/reducers";
import { reducers as customerManagementReducers } from "./pages/customers/store/reducers";
import { reducers as userManagementReducers } from "./pages/users/store/reducers";
import { reducers as resourceManagementReducers } from "./pages/resources/store/reducers";
import { reducers as inspectionManagementReducers } from "./pages/inspections/store/reducers";
import { reducers as draftManagementReducers } from "./pages/drafts/store/reducers";
import { reducers as taskStepsManagementReducers } from "./pages/task-steps/store/reducers";
import { reducers as tasksManagementReducers } from "./pages/tasks/store/reducers";
import { provideEffects } from "@ngrx/effects";
import { WarehousesEffects } from "./pages/warehouses/store/effects/warehouses.effects";
import { ProductsEffects } from "./pages/products/store/effects/products.effetcs";
import { CargosEffects } from "./pages/cargos/store/effects/cargos.effects";
import { SuppliersEffects } from "./pages/suppliers/store/effects/suppliers.effects";
import { CustomersEffects } from "./pages/customers/store/effects/customers.effects";
import { CategoriesEffects } from "./pages/categories/store/effects/categories.effects";
import { UsersEffects } from "./pages/users/store/effects/users.effects";
import { DashboardEffect } from './pages/home/store/effects/dashboard.effects';
import { ResourcesEffects } from "./pages/resources/store/effects/resources.effects";
import { InspectionsEffects}  from "./pages/inspections/store/effects/inspections.effects";
import { RoleNamesEffects } from "./pages/users/store/effects/roleNames.effects";
import { DraftsEffects } from "./pages/drafts/store/effects/drafts.effects";
import { TaskStepsEffects } from "./pages/task-steps/store/effects/task-steps.effects";
import { TasksEffects } from "./pages/tasks/store/effects/tasks.effects";

export const routes: Routes = [
  {
    path: "auth/login",
    pathMatch: "full",
    loadComponent: () => import("./pages/auth/login/login.component")
  },
  {
    path: "",
    pathMatch: "full",
    redirectTo: "home"
  },
  {
    path: "home",
    canActivate: [ AuthGuard ],
    providers: [
      provideState("dashboard-manager", dashboardManagementReducers),
      provideEffects(DashboardEffect)
    ],
    pathMatch: 'full',
    loadComponent: () => import("./pages/home/pages/home.component"),
    data: {
      title: {
        default: "Dashboard"
      },
      buttons: []
    }
  },
  {
    path: "warehouses",
    canActivate: [ AuthGuard ],
    providers: [
      provideState("warehouse-manager", warehouseManagementReducers),
      provideEffects(WarehousesEffects)
    ],
    loadChildren: () => import("./pages/warehouses/warehouses.routing")
  },
  {
    path: "products",
    canActivate: [ AuthGuard ],
    providers: [
      provideState("product-manager", productManagementReducers),
      provideEffects(ProductsEffects)
    ],
    loadChildren: () => import("./pages/products/products.routing")
  },
  {
    path: "categories",
    canActivate: [ AuthGuard ],
    providers: [
      provideState("category-manager", categoryManagementReducers),
      provideEffects(CategoriesEffects)
    ],
    loadChildren: () => import("./pages/categories/categories.routing")
  },
  {
    path: "cargos",
    canActivate: [ AuthGuard ],
    providers: [
      provideState("cargo-manager", cargoManagementReducers),
      provideEffects(CargosEffects)
    ],
    loadChildren: () => import("./pages/cargos/cargos.routing")
  },
  {
    path: "suppliers",
    canActivate: [ AuthGuard ],
    providers: [
      provideState("supplier-manager", supplierManagementReducers),
      provideEffects(SuppliersEffects)
    ],
    loadChildren: () => import("./pages/suppliers/suppliers.routing")
  },
  {
    path: "customers",
    canActivate: [ AuthGuard ],
    providers: [
      provideState("customer-manager", customerManagementReducers),
      provideEffects(CustomersEffects)
    ],
    loadChildren: () => import("./pages/customers/customers.routing")
  },
  {
    path: "resources",
    canActivate: [ AuthGuard ],
    providers: [
      provideState("resource-manager", resourceManagementReducers),
      provideEffects(ResourcesEffects)
    ],
    loadChildren: () => import("./pages/resources/resources.routing")
  },
  {
    path: "users",
    canActivate: [ AuthGuard ],
    providers: [
      provideState("user-manager", userManagementReducers),
      provideEffects([UsersEffects, RoleNamesEffects])
    ],
    loadChildren: () => import("./pages/users/users.routing")
  },
  {
    path: "inspections",
    canActivate: [ AuthGuard ],
    providers: [
      provideState("inspection-manager", inspectionManagementReducers),
      provideState("customer-manager", customerManagementReducers),
      provideEffects([InspectionsEffects, CustomersEffects])
    ],
    loadChildren: () => import("./pages/inspections/inspections.routing")
  },
  {
    path: "drafts",
    canActivate: [ AuthGuard ],
    providers: [
      provideState("draft-manager", draftManagementReducers),
      provideEffects([DraftsEffects])
    ],
    loadChildren: () => import("./pages/drafts/drafts.routing")
  },
  {
    path: "task-steps",
    canActivate: [ AuthGuard ],
    providers: [
      provideState("task-step-manager", taskStepsManagementReducers),
      provideState("draft-manager", draftManagementReducers),
      provideEffects([TaskStepsEffects, DraftsEffects])
    ],
    loadChildren: () => import("./pages/task-steps/task-steps.routing")
  },
  {
    path: "tasks",
    canActivate: [ AuthGuard ],
    providers: [
      provideState("task-manager", tasksManagementReducers),
      provideState("draft-manager", draftManagementReducers),
      provideEffects([DraftsEffects, TasksEffects])
    ],
    loadChildren: () => import("./pages/tasks/tasks.routing")
  },
  {
    path: "completed-tasks",
    canActivate: [ AuthGuard ],
    providers: [
      provideState("task-manager", tasksManagementReducers),
      provideState("draft-manager", draftManagementReducers),
      provideEffects([DraftsEffects, TasksEffects])
    ],
    loadChildren: () => import("./pages/completed-tasks/completed-tasks.routing")
  },
  {
    path: "settings",
    canActivate: [ AuthGuard ],
    loadChildren: () => import("./pages/settings/settings.routing")
  },
  {
    path: "fic",
    canActivate: [ AuthGuard ],
    loadChildren: () => import("./pages/fic/fic.routing")
  },
  {
    path: "**",
    redirectTo: "404"
  },
  {
    path: "404",
    data: {
      title: {
        default: "",
        other: ""
      },
      buttons: []
    },
    component: NotFoundComponent,
  },
];
