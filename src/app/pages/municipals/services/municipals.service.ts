import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { CookieService } from 'ngx-cookie-service';
import { environment } from "../../../../environments/environment";
import { QuerySearch } from "../../../../global";
import { Municipal, PartialMunicipal } from "../../../models/Municipals";
import { PaginateDatasource } from "../../../models/Table";

const BASE_URL = environment.BASE_URL;

@Injectable({
  providedIn: 'root',
})
export class MunicipalsService {

  http = inject(HttpClient);
  cookieService = inject(CookieService);

  addMunicipal(municipal: PartialMunicipal) {
    const body = { ...municipal, id: undefined }
    return this.http.post<Municipal>(`${ BASE_URL }/municipals/create`, body)
  }

  editMunicipal(id: string, municipal: PartialMunicipal) {
    const body = { ...municipal, id: undefined }
    return this.http.patch<Municipal>(`${ BASE_URL }/municipals/${ id }`, body)
  }

  deleteMunicipal(id: string) {
    return this.http.delete<Municipal>(`${ BASE_URL }/municipals/${ id }`)
  }

  loadPaginateMunicipals(query: QuerySearch<string, string>) {
    return this.http.post<PaginateDatasource<Municipal>>(`${ BASE_URL }/municipals/search`, query);
  }

  getActiveMunicipal(id: string) {
    return this.http.get<Municipal>(`${ BASE_URL }/municipals/${ id }`)
  }
}
