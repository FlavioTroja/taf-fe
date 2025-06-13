import { createAction, props } from "@ngrx/store";
import { NavigationExtras } from "@angular/router";

export const go = createAction("[Router] go", props<{ path: any[], extras?: NavigationExtras }>());

export const back = createAction("[Router] back", props<{ path?: any[]}>());
export const forward = createAction("[Router] foreward");
