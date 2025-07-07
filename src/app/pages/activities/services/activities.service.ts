import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { CookieService } from 'ngx-cookie-service';
import { environment } from "../../../../environments/environment";
import { QuerySearch } from "../../../../global";
import { Activity, PartialActivity } from "../../../models/Activities";
import { PaginateDatasource } from "../../../models/Table";

const BASE_URL = environment.BASE_URL;

@Injectable({
  providedIn: 'root',
})
export class ActivitiesService {

  http = inject(HttpClient);
  cookieService = inject(CookieService);

  addActivity(activity: PartialActivity) {
    const body = { ...activity, id: undefined }
    return this.http.post<Activity>(`${ BASE_URL }/activities/create`, body)
  }

  editActivity(id: string, activity: PartialActivity) {
    const body = { ...activity, id: undefined }
    return this.http.patch<Activity>(`${ BASE_URL }/activities/${ id }`, body)
  }

  deleteActivity(id: string) {
    return this.http.delete<Activity>(`${ BASE_URL }/activities/${ id }`)
  }

  loadActivities(query: QuerySearch<string, string>) {
    return this.http.post<PaginateDatasource<Activity>>(`${ BASE_URL }/activities/search`, query);
  }

  getActiveActivity(id: string) {
    return this.http.get<Activity>(`${ BASE_URL }/activities/${ id }`)
  }
}
