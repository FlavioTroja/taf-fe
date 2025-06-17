import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment.dev";
import { Municipality } from "../../../models/Municipalities";
import { PaginateDatasource } from "../../../models/Table";

const BASE_URL = environment.BASE_URL;

@Injectable({
  providedIn: 'root',
})
export class MunicipalitiesService {

  http = inject(HttpClient);

  loadMunicipalities() {
    return this.http.get<PaginateDatasource<Municipality>>(`${ BASE_URL }/municipals`)
  }

}
