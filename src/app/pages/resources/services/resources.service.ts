import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import {PartialResource, Resource, ResourceFilter} from "../../../models/Resource";
import { DefaultQueryParams, Query } from "../../../../global";
import { PaginateDatasource } from "../../../models/Table";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class ResourcesService {
  http = inject(HttpClient);

  addResource(payload: PartialResource) {
    const newPayload = {
      ...payload,
      id: undefined,
    }

    return this.http.post<Resource>(`${BASE_URL}/resources/create`, newPayload);
  }

  getResource(id: number, params?: DefaultQueryParams) {
    return this.http.get<Resource>(`${BASE_URL}/resources/${id}`, { params: { ...params } });
  }

  editResource(id: number, payload: PartialResource) {
    const body = { ...payload, id: undefined };
    return this.http.patch<Resource>(`${BASE_URL}/resources/${id}`, body);
  }

  deleteResource(id: number) {
    return this.http.delete<Resource>(`${BASE_URL}/resources/${id}`);
  }

  loadResources(payload: Query<ResourceFilter>) {
    return this.http.post<PaginateDatasource<Resource>>(`${BASE_URL}/resources`, payload);
  }


}
