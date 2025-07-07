import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { CookieService } from 'ngx-cookie-service';
import { environment } from "../../../../environments/environment";
import { QuerySearch } from "../../../../global";
import { Event, PartialEvent } from "../../../models/Event";
import { PaginateDatasource } from "../../../models/Table";

const BASE_URL = environment.BASE_URL;

@Injectable({
  providedIn: 'root',
})
export class EventsService {

  http = inject(HttpClient);
  cookieService = inject(CookieService);

  addEvent(event: PartialEvent) {
    const body = { ...event, id: undefined }
    return this.http.post<Event>(`${ BASE_URL }/events/create`, body)
  }

  editEvent(id: string, event: PartialEvent) {
    const body = { ...event, id: undefined }
    return this.http.patch<Event>(`${ BASE_URL }/events/${ id }`, body)
  }

  deleteEvent(id: string) {
    return this.http.delete<Event>(`${ BASE_URL }/events/${ id }`)
  }

  loadEvents(query: QuerySearch<string, string>) {
    return this.http.post<PaginateDatasource<Event>>(`${ BASE_URL }/events/search`, query);
  }

  getActiveEvent(id: string) {
    return this.http.get<Event>(`${ BASE_URL }/events/${ id }`)
  }
}
