import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter } from '@angular/router';
import { provideEffects } from "@ngrx/effects";
import { provideRouterStore, routerReducer, RouterReducerState, RouterState } from "@ngrx/router-store";
import { provideStore } from "@ngrx/store";
import { provideStoreDevtools } from "@ngrx/store-devtools";

import { routes } from './app.routes';
import { AuthInterceptor } from "./core/auth/services/auth.interceptor";
import { AuthEffects } from "./core/auth/store/auth.effects";
import { AuthState, reducer as authReducer } from "./core/auth/store/auth.reducer";
import { HideEffects } from "./core/hide/store/hide.effects";
import { HideState, reducer as configReducer } from "./core/hide/store/hide.reducer";
import { ProfileEffects } from "./core/profile/store/profile.effects";
import { ProfileState, reducer as profileReducer } from "./core/profile/store/profile.reducer";
import { RouterEffects } from "./core/router/store/router.effects";
import { SidebarEffects } from "./core/ui/store/ui.effects";
import { reducer as sidebarReducer, UIState } from "./core/ui/store/ui.reducer";

export interface AppState {
  auth: AuthState,
  ui: UIState,
  profile: ProfileState,
  router: RouterReducerState,
  hide: HideState,
}

export const appConfig: ApplicationConfig = {
  providers: [
    // provideRouter(routes, withDebugTracing()),
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([ AuthInterceptor ])),
    provideStore({
      auth: authReducer,
      ui: sidebarReducer,
      profile: profileReducer,
      router: routerReducer,
      hide: configReducer,
    }, {
      runtimeChecks: {
        strictActionSerializability: true,
        strictActionImmutability: true,
        strictStateImmutability: true,
        strictStateSerializability: true
      }
    }),
    provideStoreDevtools({
      maxAge: 250
    }),
    provideRouterStore({
      routerState: RouterState.Minimal
    }),
    provideEffects([
      RouterEffects,
      ProfileEffects,
      AuthEffects,
      SidebarEffects,
      HideEffects,
    ]),
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' }
  ]
};
