import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { Query } from "../../../../global";
import { PaginateDatasource } from "../../../models/Table";
import { Task, TaskFilter } from "../../../models/Task";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class TasksService {
  http = inject(HttpClient);

  loadTasks(payload: Query<TaskFilter>) {
    return this.http.post<PaginateDatasource<Task>>(`${BASE_URL}/tasks`, payload);
  }
}
