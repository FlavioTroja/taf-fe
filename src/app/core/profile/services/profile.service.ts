import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { environment } from "../../../../environments/environment";
import { AppState } from "../../../app.config";
import { Municipal } from "../../../models/Municipals";
import { PartialUser } from "../../../models/User";

const BASE_URL = environment.BASE_URL;

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  http = inject(HttpClient);
  store: Store<AppState> = inject(Store);

  load() {
    return this.http.get<PartialUser>(`${ BASE_URL }/auth/profile`);
  }

  edit(user: PartialUser) {
    return this.http.patch<PartialUser>(`${ BASE_URL }/auth/me`, user);
  }

  findByDomain(domain: string) {
    return this.http.get<Municipal>(`${ BASE_URL }/public/municipals/${ domain }`);
  }

}
