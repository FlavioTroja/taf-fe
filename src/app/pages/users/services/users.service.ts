import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { PartialUser, User, UserFilter } from "../../../models/User";
import { Query } from "../../../../global";
import { PaginateDatasource } from "../../../models/Table";
import { ChangePassword } from "../store/reducers/change-password.reducer";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  http = inject(HttpClient);

  addUser(payload: PartialUser) {
    return this.http.post<User>(`${BASE_URL}/users/create`, payload);
  }

  getUser(id: number) {
    return this.http.get<User>(`${BASE_URL}/users/${id}`);
  }

  editUser(id: number, payload: PartialUser) {
    const body = { ...payload, id: undefined };
    return this.http.patch<User>(`${BASE_URL}/users/${id}`, body);
  }

  deleteUser(id: number) {
    return this.http.delete<User>(`${BASE_URL}/users/${id}`);
  }

  loadUsers(payload: Query<UserFilter>) {
    return this.http.post<PaginateDatasource<User>>(`${BASE_URL}/users`, payload);
  }

  loadAllUsers(payload: Query<UserFilter>) {
    return this.http.post<User[]>(`${BASE_URL}/users/all`, payload);
  }

  changeUserPassword(id: number, payload: ChangePassword) {
    return this.http.patch(`${BASE_URL}/users/changePassword/${id}`, payload);
  }

}
