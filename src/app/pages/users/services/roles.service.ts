import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { RoleName } from "../../../models/User";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class RolesService {
  http = inject(HttpClient);

  getRolesNames() {
    return this.http.get<RoleName[]>(`${BASE_URL}/roles/names`);
  }

}
