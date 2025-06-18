import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { CookieService } from 'ngx-cookie-service';
import { environment } from "../../../../environments/environment.dev";
import { Municipality } from "../../../models/Municipalities";
import { PaginateDatasource } from "../../../models/Table";

const BASE_URL = environment.BASE_URL;

@Injectable({
  providedIn: 'root',
})
export class MunicipalitiesService {

  http = inject(HttpClient);
  cookieService = inject(CookieService);

  loadMunicipalities() {
    const municipalityId = this.cookieService.get('municipalityId');

    const headers = new HttpHeaders().set('X-Municipality-Id', municipalityId);

    return this.http.get<PaginateDatasource<Municipality>>(`${BASE_URL}/municipals`, { headers });
  }
}
