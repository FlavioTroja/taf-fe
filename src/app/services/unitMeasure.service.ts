import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { UnitMeasure } from "../models/UnitMeasure";


const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class UnitMeasureService {
  http = inject(HttpClient);

  loadAllUnitMeasures(payload: Partial<UnitMeasureQuery>) {
    return this.http.post<UnitMeasure[]>(`${BASE_URL}/unitMeasures/all`, payload);
  }

  getUnitMeasure(id: number) {
    return this.http.get<UnitMeasure>(`${BASE_URL}/unitMeasures/${id}`);
  }

}

export type UnitMeasureQuery = {
  value: string;
  isForProduct: boolean;
  isForWarehouse: boolean;
}
