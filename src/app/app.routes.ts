import { Routes } from '@angular/router';
import { provideEffects } from "@ngrx/effects";
import { provideState } from "@ngrx/store";
import NotFoundComponent from "./components/not-found/not-found.component";
import { AuthGuard } from "./core/auth/services/auth.guard";
import { DashboardEffect } from './pages/home/store/effects/dashboard.effects';
import { reducers as dashboardManagementReducers } from "./pages/home/store/reducers";
import { MunicipalitiesEffects } from "./pages/municipalities/store/effects/municipalities.effects";
import { reducers as municipalitiesManagementReducers } from "./pages/municipalities/store/reducers";
import { RoleNamesEffects } from "./pages/users/store/effects/roleNames.effects";
import { UsersEffects } from "./pages/users/store/effects/users.effects";
import { reducers as userManagementReducers } from "./pages/users/store/reducers";

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
    path: 'municipalities',
    canActivate: [ AuthGuard ],
    providers: [
      provideState('municipalities-manager', municipalitiesManagementReducers),
      provideEffects([ MunicipalitiesEffects ])
    ],
    loadChildren: () => import("./pages/municipalities/municipalities.routing")
  },
  {
    path: "users",
    canActivate: [ AuthGuard ],
    providers: [
      provideState("user-manager", userManagementReducers),
      provideEffects([ UsersEffects, RoleNamesEffects ])
    ],
    loadChildren: () => import("./pages/users/users.routing")
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
