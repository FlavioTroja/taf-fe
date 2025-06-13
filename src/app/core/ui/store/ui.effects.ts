import { Injectable } from "@angular/core";
import { Actions } from "@ngrx/effects";


@Injectable({
  providedIn: 'root'
})
export class SidebarEffects {
  constructor(private actions$: Actions) {}

  // extendSidebar$ = createEffect(() => this.actions$.pipe(
  //   ofType(SidebarActions.toggleSidebar),
  //   exhaustMap(() => [
  //     SidebarActions.toggleSidebarSuccess({ collapsed: false })
  //   ])
  // ));

}
