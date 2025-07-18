import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { CookieService } from 'ngx-cookie-service';
import { environment } from "../../../../environments/environment";
import { QuerySearch } from "../../../../global";
import { Notification, PartialNotification } from "../../../models/Notifications";
import { PaginateDatasource } from "../../../models/Table";

const BASE_URL = environment.BASE_URL;

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {

  http = inject(HttpClient);
  cookieService = inject(CookieService);

  addNotification(notification: PartialNotification) {
    const body = { ...notification, id: undefined }
    return this.http.post<Notification>(`${ BASE_URL }/notifications/create`, body)
  }

  editNotification(id: string, notification: PartialNotification) {
    const body = { ...notification, id: undefined }
    return this.http.patch<Notification>(`${ BASE_URL }/notifications/${ id }`, body)
  }

  deleteNotification(id: string) {
    return this.http.delete<Notification>(`${ BASE_URL }/notifications/${ id }`)
  }

  loadNotifications(query: QuerySearch) {
    return this.http.post<PaginateDatasource<Notification>>(`${ BASE_URL }/notifications/search`, query);
  }

  getActiveNotification(id: string) {
    return this.http.get<Notification>(`${ BASE_URL }/notifications/${ id }`)
  }
}
