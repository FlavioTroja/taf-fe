import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { PartialCargo, Cargo, CargoFilter } from "../../../models/Cargo";
import { DefaultQueryParams, Query } from "../../../../global";
import { PaginateDatasource } from "../../../models/Table";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class CargosService {
  http = inject(HttpClient);

  addCargo(payload: PartialCargo) {
    return this.http.post<Cargo>(`${BASE_URL}/cargos/create`, payload);
  }

  getCargo(id: number, params?: DefaultQueryParams) {
    return this.http.get<Cargo>(`${BASE_URL}/cargos/${id}`, {
      params: {
        ...params
      }
    });
  }

  editCargo(id: number, payload: PartialCargo) {
    const body = { ...payload, id: undefined };
    return this.http.patch<Cargo>(`${BASE_URL}/cargos/${id}`, body);
  }

  deleteCargo(id: number) {
    return this.http.delete<Cargo>(`${BASE_URL}/cargos/${id}`);
  }

  loadCargos(payload: Query<CargoFilter>) {
    return this.http.post<PaginateDatasource<Cargo>>(`${BASE_URL}/cargos`, payload);
  }


}
