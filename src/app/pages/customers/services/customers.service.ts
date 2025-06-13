import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { PartialCustomer, Customer, CustomerFilter } from "../../../models/Customer";
import { Query } from "../../../../global";
import { PaginateDatasource } from "../../../models/Table";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  http = inject(HttpClient);

  addCustomer(payload: PartialCustomer) {
    const newPayload = {
      ...payload,
      id: undefined,
      addresses: payload.addresses?.map(p => ({ ...p, id: undefined })),
    }
    return this.http.post<Customer>(`${BASE_URL}/customers/create`, newPayload);
  }

  getCustomer(id: number) {
    return this.http.get<Customer>(`${BASE_URL}/customers/${id}`, { params: { populate: "addresses" } });
  }

  editCustomer(id: number, payload: PartialCustomer) {
    const body = { ...payload, id: undefined };
    return this.http.patch<Customer>(`${BASE_URL}/customers/${id}`, body);
  }

  deleteCustomer(id: number) {
    return this.http.delete<Customer>(`${BASE_URL}/customers/${id}`);
  }

  loadCustomers(payload: Query<CustomerFilter>) {
    return this.http.post<PaginateDatasource<Customer>>(`${BASE_URL}/customers`, payload);
  }

  loadAllCustomers(payload: Query<CustomerFilter>) {
    return this.http.post<Customer[]>(`${BASE_URL}/customers/all`, payload);
  }


}
