import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class FileService {
  http = inject(HttpClient);

  uploadImage(payload: FormData) {
    return this.http.post<{ url: string }>(`${BASE_URL}/images/upload`, payload);
  }

  uploadPdf(payload: FormData) {
    return this.http.post<{ url: string }>(`${BASE_URL}/pdf/upload`, payload);
  }


}
