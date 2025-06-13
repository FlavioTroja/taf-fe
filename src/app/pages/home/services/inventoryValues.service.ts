import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { InventoryValuesLastStatisticResponse, InventoryValuesStatisticsRequest, InventoryValuesStatisticsResponse } from "src/app/models/InventoryValues";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class InventoryValuesService {
  http = inject(HttpClient);

  getInventoryValuesStatistic(payload: InventoryValuesStatisticsRequest) {
    return this.http.post<InventoryValuesStatisticsResponse[]>(`${BASE_URL}/inventoryValues/history`, payload)
  }

  getInventoryValuesLastStatistic() {
    return this.http.get<InventoryValuesLastStatisticResponse>(`${BASE_URL}/inventoryValues/last`)
  }
}
