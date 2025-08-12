import { Routes } from '@angular/router';
import { provideEffects } from "@ngrx/effects";
import { provideState } from "@ngrx/store";
import NotFoundComponent from "./components/not-found/not-found.component";
import { AuthGuard } from "./core/auth/services/auth.guard";
import { RegisterGuard } from "./core/auth/services/register.guard";
import { ActivitiesEffects } from "./pages/activities/store/effects/activities.effects";
import { reducers as activitiesManagementReducers } from "./pages/activities/store/reducers";
import { EventsEffects } from "./pages/events/store/effects/events.effects";
import { reducers as eventsManagementReducers } from "./pages/events/store/reducers";
import { DashboardEffect } from './pages/home/store/effects/dashboard.effects';
import { reducers as dashboardManagementReducers } from "./pages/home/store/reducers";
import { MunicipalsEffects } from "./pages/municipals/store/effects/municipals.effects";
import { reducers as municipalsManagementReducers } from "./pages/municipals/store/reducers";
import { NewsEffects } from "./pages/news/store/effects/news.effects";
import { reducers as newsManagementReducers } from "./pages/news/store/reducers";
import { NotificationEffects } from "./pages/notifications/store/effects/notification.effects";
import { reducers as notificationsManagementReducers } from "./pages/notifications/store/reducers";
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
    path: "auth/register",
    pathMatch: "full",
    loadComponent: () => import("./pages/auth/register/register.component")
  },
  {
    canActivate: [RegisterGuard],
    path: "auth/confirm",
    pathMatch: "full",
    loadComponent: () => import("./pages/auth/confirm/confirm.component")
  },
  {
    path: "",
    pathMatch: "full",
    redirectTo: "home"
  },
  {
    path: "home",
    canActivate: [AuthGuard],
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
    path: 'municipals',
    canActivate: [AuthGuard],
    providers: [
      provideState('municipals-manager', municipalsManagementReducers),
      provideEffects([MunicipalsEffects])
    ],
    loadChildren: () => import("./pages/municipals/municipals.routing")
  },
  {
    path: 'activities',
    canActivate: [AuthGuard],
    providers: [
      provideState('activities-manager', activitiesManagementReducers),
      provideEffects([ActivitiesEffects])
    ],
    loadChildren: () => import("./pages/activities/activities.routing")
  },
  {
    path: 'news',
    canActivate: [AuthGuard],
    providers: [
      provideState('news-manager', newsManagementReducers),
      provideEffects([NewsEffects])
    ],
    loadChildren: () => import("./pages/news/news.routing")
  },
  {
    path: 'events',
    canActivate: [AuthGuard],
    providers: [
      provideState('events-manager', eventsManagementReducers),
      provideState('activities-manager', activitiesManagementReducers),
      provideEffects([EventsEffects, ActivitiesEffects])
    ],
    loadChildren: () => import("./pages/events/events.routing")
  },
  {
    path: "users",
    canActivate: [AuthGuard],
    providers: [
      provideState("user-manager", userManagementReducers),
      provideEffects([UsersEffects, RoleNamesEffects])
    ],
    loadChildren: () => import("./pages/users/users.routing")
  },
  {
    path: "notifications",
    canActivate: [AuthGuard],
    providers: [
      provideState("notifications-manager", notificationsManagementReducers),
      provideState("user-manager", userManagementReducers),
      provideEffects([NotificationEffects, UsersEffects])
    ],
    loadChildren: () => import("./pages/notifications/notifications.routing")
  },
  {
    path: "settings",
    canActivate: [AuthGuard],
    loadChildren: () => import("./pages/settings/settings.routing")
  },
  {
    path: "fic",
    canActivate: [AuthGuard],
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
