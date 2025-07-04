import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Query, QuerySearch } from "../../../../global";
import { PaginateDatasource } from "../../../models/Table";
import { PartialUser, User, UserFilter } from "../../../models/User";
import { ChangePassword } from "../store/reducers/change-password.reducer";

const BASE_URL = environment.BASE_URL;

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  http = inject(HttpClient);

  addUser(payload: PartialUser) {
    return this.http.post<User>(`${ BASE_URL }/users/create`, payload);
  }

  getUser(id: string) {
    return this.http.get<User>(`${ BASE_URL }/users/${ id }`);
  }

  editUser(id: number, payload: PartialUser) {
    const body = { ...payload, id: undefined };
    return this.http.patch<User>(`${ BASE_URL }/users/${ id }`, body);
  }

  deleteUser(id: string) {
    return this.http.delete<User>(`${ BASE_URL }/users/${ id }`);
  }

  loadUsers(payload: QuerySearch<string, string>) {
    return this.http.post<PaginateDatasource<User>>(`${ BASE_URL }/users/search`, payload);
  }

  loadAllUsers(payload: Query<UserFilter>) {
    return this.http.post<User[]>(`${ BASE_URL }/users/all`, payload);
  }

  changeUserPassword(id: string, payload: ChangePassword) {
    return this.http.patch(`${ BASE_URL }/users/changePassword/${ id }`, payload);
  }

}
