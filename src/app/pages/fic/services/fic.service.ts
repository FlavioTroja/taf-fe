import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class FicService {
  http = inject(HttpClient);

  verifyResponseUrl(responseUrl: string) {
    return this.http.post(`${BASE_URL}/invoices/fic/verify`, { token: responseUrl });
  }

}
