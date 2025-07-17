import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { CookieService } from 'ngx-cookie-service';
import { environment } from "../../../../environments/environment";
import { QuerySearch } from "../../../../global";
import { News, PartialNews } from "../../../models/News";
import { PaginateDatasource } from "../../../models/Table";

const BASE_URL = environment.BASE_URL;

@Injectable({
  providedIn: 'root',
})
export class NewsService {

  http = inject(HttpClient);
  cookieService = inject(CookieService);

  addNews(news: PartialNews) {
    const body = { ...news, id: undefined }
    return this.http.post<News>(`${ BASE_URL }/news/create`, body)
  }

  editNews(id: string, news: PartialNews) {
    const body = { ...news, id: undefined }
    return this.http.patch<News>(`${ BASE_URL }/news/${ id }`, body)
  }

  deleteNews(id: string) {
    return this.http.delete<News>(`${ BASE_URL }/news/${ id }`)
  }

  loadNews(query: QuerySearch) {
    return this.http.post<PaginateDatasource<News>>(`${ BASE_URL }/news/search`, query);
  }

  getActiveNews(id: string) {
    return this.http.get<News>(`${ BASE_URL }/news/${ id }`)
  }
}
