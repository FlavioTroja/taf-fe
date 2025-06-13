import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { Query } from "../../../../global";
import { PaginateDatasource } from "../../../models/Table";
import {
  PartialPlanningSetupUpdate,
  PartialSetup,
  PartialSetupDraftForm,
  PlanningSetupUpdate,
  Setup,
  SetupCreate,
  SetupFilter
} from "../../../models/Setup";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class SetupsService {
  http = inject(HttpClient);

  createSetup(body: SetupCreate) {
    return this.http.post<Setup>(`${BASE_URL}/setups/create`, body);
  }

  getSetup(id: number) {
    return this.http.get<Setup>(`${BASE_URL}/setups/${id}`,
      {
        params:
        {
          populate: "inspection.user address customer participants tasks tasks.taskSteps costs costs.product costs.resource"
        }
      }
    );
  }

  editSetup(id: number, payload: PartialSetup) {
    const body = { ...payload, id: undefined };
    return this.http.patch<Setup>(`${BASE_URL}/setups/${id}`, body);
  }

  editPlanningSetup(id: number, payload: PartialPlanningSetupUpdate) {
    return this.http.patch<Setup>(`${BASE_URL}/setups/planning/${id}`, payload);
  }

  deleteSetup(id: number) {
    return this.http.delete<Setup>(`${BASE_URL}/setups/${id}`);
  }

  loadSetups(payload: Query<SetupFilter>) {
    return this.http.post<PaginateDatasource<Setup>>(`${BASE_URL}/setups`, payload);
  }

  editSetupDraft(id: number, payload: PartialSetupDraftForm) {
    return this.http.patch<PlanningSetupUpdate>(`${BASE_URL}/setups/draft/${id}`, payload);
  }

  quoteDraftById(id: number) {
    return this.http.put<Setup>(`${BASE_URL}/setups/quote/draft/${id}`, {});
  }

  backToDraftById(id: number) {
    return this.http.put<Setup>(`${BASE_URL}/setups/quote/step/back/${id}`, {});
  }

  confirmQuoteById(id: number) {
    return this.http.put<Setup>(`${BASE_URL}/setups/quote/confirm/${id}`, {});
  }

  toggleSetupStatusCanceled(id: number) {
    return this.http.put<Setup>(`${BASE_URL}/setups/toggle/canceled/${id}`, {});
  }

  deleteCanceledSetup(id: number) {
    return this.http.delete<Setup>(`${BASE_URL}/setups/delete/${id}`);
  }
}
