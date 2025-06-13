import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { PartialSupplier, Supplier, SupplierFilter } from "../../../models/Supplier";
import { DefaultQueryParams, Query } from "../../../../global";
import { PaginateDatasource } from "../../../models/Table";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class SuppliersService {
  http = inject(HttpClient);

  addSupplier(payload: PartialSupplier) {
    const newPayload = {
      ...payload,
      id: undefined,
    }
    return this.http.post<Supplier>(`${BASE_URL}/suppliers/create`, newPayload);
  }

  getSupplier(id: number,  params?: DefaultQueryParams) {
    return this.http.get<Supplier>(`${BASE_URL}/suppliers/${id}`, { params: { ...params } });
  }

  editSupplier(id: number, payload: PartialSupplier) {
    const body = { ...payload, id: undefined };
    return this.http.patch<Supplier>(`${BASE_URL}/suppliers/${id}`, body);
  }

  deleteSupplier(id: number) {
    return this.http.delete<Supplier>(`${BASE_URL}/suppliers/${id}`);
  }

  loadSuppliers(payload: Query<SupplierFilter>) {
    return this.http.post<PaginateDatasource<Supplier>>(`${BASE_URL}/suppliers`, payload);
  }

  loadAllSuppliers(payload: Query<object>) {
    return this.http.post<Supplier[]>(`${BASE_URL}/suppliers/all`, payload);
  }


}
