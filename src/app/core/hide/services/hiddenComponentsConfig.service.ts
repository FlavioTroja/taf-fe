import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { Store } from "@ngrx/store";
import { AppState } from "../../../app.config";
import { HiddenComponentConfig } from "../../../models/HiddenComponentConfig";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class HiddenComponentsConfigService {
  http = inject(HttpClient);
  store: Store<AppState> = inject(Store);

  getOwn() {
    return this.http.get<HiddenComponentConfig>(`${BASE_URL}/config/hidden/own`);
  }

}
