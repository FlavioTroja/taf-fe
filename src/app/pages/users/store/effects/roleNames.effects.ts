import { Injectable } from "@angular/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { RolesService } from "../../services/roles.service";

@Injectable({
  providedIn: 'root'
})
export class RoleNamesEffects {

  constructor(
    private actions$: Actions,
    private rolesService: RolesService,
    private store: Store
  ) {
  }

}
