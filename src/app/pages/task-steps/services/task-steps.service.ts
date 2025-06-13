import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { DefaultQueryParams, Query } from "../../../../global";
import { PaginateDatasource } from "../../../models/Table";
import { TaskStep, TaskStepFilter, TaskStepFormOnCompletion } from "../../../models/TaskSteps";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class TaskStepsService {
  http = inject(HttpClient);

  loadTaskSteps(payload: Query<TaskStepFilter>) {
    return this.http.post<PaginateDatasource<TaskStep>>(`${BASE_URL}/taskSteps`, payload);
  }

  assignMeTaskStep(id: number) {
    return this.http.put<TaskStep>(`${BASE_URL}/taskSteps/assign/me/${id}`, {});
  }

  completeTaskStep(payload: TaskStepFormOnCompletion) {
    return this.http.put<TaskStep>(`${BASE_URL}/taskSteps/complete/${payload.id}`, payload);
  }

  getTaskStep(id: number, params?: DefaultQueryParams) {
    return this.http.get<TaskStep>(`${BASE_URL}/taskSteps/${id}`, { params: { ...params } });
  }
}
