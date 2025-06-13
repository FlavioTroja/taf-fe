import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import {DefaultQueryParams, Query, QueryAll} from "../../../../global";
import { PaginateDatasource } from "../../../models/Table";
import {
  Inspection,
  InspectionFilter,
  InspectionStatusDTO,
  PartialInspection,
  PartialInspectionDetails
} from "../../../models/Inspection";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class InspectionsService {
  http = inject(HttpClient);

  getInspection(id: number, params?: DefaultQueryParams) {
    return this.http.get<Inspection>(`${BASE_URL}/inspections/${id}`, {
      params: {
        ...params,
      }
    });
  }

  updateInspectionStatus(id: number, inspectionStatusPayload: InspectionStatusDTO) {
    return this.http.put<InspectionStatusDTO>(`${BASE_URL}/inspections/status/${id}`, {
      newStatus: inspectionStatusPayload.newStatus,
      rejectionReason: inspectionStatusPayload.rejectionReason
    })
  }

  editInspection(id: number, payload: PartialInspection) {
    const body = { ...payload, id: undefined };
    return this.http.patch<Inspection>(`${BASE_URL}/inspections/${id}`, body);
  }

  deleteInspection(id: number) {
    return this.http.delete<Inspection>(`${BASE_URL}/inspections/${id}`);
  }

  loadInspections(payload: Query<InspectionFilter>) {
    return this.http.post<PaginateDatasource<Inspection>>(`${BASE_URL}/inspections`, payload);
  }

  loadAllInspections(payload: QueryAll<InspectionFilter>) {
    return this.http.post<Inspection[]>(`${BASE_URL}/inspections/all`, payload);
  }

  completeInspectionStatus(id: number) {
    return this.http.put<Inspection>(`${BASE_URL}/inspections/complete/${id}`, {});
  }

  editInspectionDetails(id: number, payload: PartialInspectionDetails) {
    return this.http.patch<any>(`${BASE_URL}/inspections/details/${id}`, payload);
  }

}
