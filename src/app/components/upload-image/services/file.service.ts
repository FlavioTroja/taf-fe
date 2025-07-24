import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Activity } from "../../../models/Activities";
import { News } from "../../../models/News";
import { User } from "../../../models/User";
import { Municipal } from "../../../models/Municipals";

const BASE_URL = environment.BASE_URL;

@Injectable({
  providedIn: 'root'
})
export class FileService {
  http = inject(HttpClient);

  uploadUserImage(formData: FormData, id: string) {
    return this.http.post<User>(`${ BASE_URL }/users/${ id }/upload-photo`, formData);
  }

  uploadActivityGalleryImages(formData: FormData, id: string) {
    return this.http.post<Activity>(`${ BASE_URL }/activities/${ id }/upload-gallery`, formData);
  }

  uploadActivityLogoImage(formData: FormData, id: string) {
    return this.http.post<Activity>(`${ BASE_URL }/activities/${ id }/upload-logo`, formData)
  }

  updateActivityCoverImage(formData: FormData, id: string) {
    return this.http.post<Activity>(`${ BASE_URL }/activities/${ id }/upload-cover`, formData)
  }

  updateNewsGalleryImages(formData: FormData, id: string) {
    return this.http.post<News>(`${ BASE_URL }/news/${ id }/upload-gallery`, formData);
  }

  deleteActivityGalleryImage(imageName: string, id: string) {
    return this.http.delete<Activity>(`${ BASE_URL }/activities/${ id }/gallery/${ imageName }`);
  }

  deleteNewsGalleryImage(imageName: string, id: string) {
    return this.http.delete<News>(`${ BASE_URL }/news/${ id }/gallery/${ imageName }`);
  }

  deleteEventGalleryImage(imageName: string, id: string) {
    return this.http.delete<News>(`${ BASE_URL }/events/${ id }/gallery/${ imageName }`);
  }

  updateNewsCoverImage(formData: FormData, id: string) {
    return this.http.post<News>(`${ BASE_URL }/news/${ id }/upload-cover`, formData);
  }

  updateEventsCoverImage(formData: FormData, id: string) {
    return this.http.post<News>(`${ BASE_URL }/events/${ id }/upload-cover`, formData);
  }

  updateEventsGalleryImages(formData: FormData, id: string) {
    return this.http.post<News>(`${ BASE_URL }/events/${ id }/upload-gallery`, formData);
  }

  uploadMunicipalsLogoImage(formData: FormData, id: string) {
    return this.http.post<Municipal>(`${ BASE_URL }/municipals/${ id }/upload-logo`, formData)
  }

  uploadMunicipalsCoverImage(formData: FormData, id: string) {
    return this.http.post<Municipal>(`${ BASE_URL }/municipals/${ id }/upload-cover`, formData)
  }

  uploadMunicipalsIconImage(formData: FormData, id: string) {
    return this.http.post<Municipal>(`${ BASE_URL }/municipals/${ id }/upload-icon`, formData)
  }
}
