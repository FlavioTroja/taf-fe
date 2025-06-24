import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";

const BASE_URL = environment.BASE_URL;

@Injectable({
  providedIn: 'root'
})
export class FileService {
  http = inject(HttpClient);

  uploadUserImage(payload: FormData, id: string) {
    return this.http.post<{ url: string }>(`${ BASE_URL }/users/${ id }/upload-foto`, payload);
  }

  uploadGalleryImage(formData: FormData, id: string) {
    return this.http.post<{ url: string }>(`${ BASE_URL }/activities/${ id }/upload-gallery`, formData);
  }

  uploadLogoImage(formData: FormData, id: string) {
    return this.http.post<{ url: string }>(`${ BASE_URL }/activities/${ id }/upload-logo`, formData)
  }

  updateCoverImage(formData: FormData, id: string) {
    return this.http.post<{ url: string }>(`${ BASE_URL }/activities/${ id }/upload-cover`, formData)
  }

  /*
    uploadPdf(payload: FormData) {
      return this.http.post<{ url: string }>(`${BASE_URL}/pdf/upload`, payload);
    }
  */


}
