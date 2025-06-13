import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { PartialWarehouse, Warehouse } from "../../../models/Warehouse";
import { Query } from "../../../../global";
import { PaginateDatasource } from "../../../models/Table";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class WarehousesService {
  http = inject(HttpClient);

  addWarehouse(payload: Warehouse) {
    return this.http.post<Warehouse>(`${BASE_URL}/warehouses/create`, payload);
  }

  getWarehouse(id: number) {
    return this.http.get<Warehouse>(`${BASE_URL}/warehouses/${id}`);
  }

  editWarehouse(id: number, payload: PartialWarehouse) {
    const body = { ...payload, id: undefined };
    return this.http.patch<Warehouse>(`${BASE_URL}/warehouses/${id}`, body);
  }

  deleteWarehouse(id: number) {
    return this.http.delete<Warehouse>(`${BASE_URL}/warehouses/${id}`);
  }

  loadWarehouses(payload: Query<object>) {
    return this.http.post<PaginateDatasource<Warehouse>>(`${BASE_URL}/warehouses`, payload);
  }

  loadAllWarehouses(payload: Query<object>) {
    return this.http.post<Warehouse[]>(`${BASE_URL}/warehouses/all`, payload);
  }

  loadProductsOnWarehouses(id: number, payload: Query<object>) {
    return this.http.post<Warehouse>(`${BASE_URL}/warehouses/${id}/products`, payload);
  }


}
