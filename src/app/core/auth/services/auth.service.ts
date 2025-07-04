import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Auth, ConfirmPayload, LoginPayload, RegisterPayload, RegisterResponse } from "../../../models/Auth";

const BASE_URL = environment.BASE_URL;
const AUTH_KEY = "Authorization";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http = inject(HttpClient);

  login(payload: LoginPayload) {
    return this.http.post<Auth>(`${ BASE_URL }/auth/login`, payload);
  }

  register(payload: RegisterPayload) {
    return this.http.post<RegisterResponse>(`${ BASE_URL }/auth/register`, payload);
  }

  confirm(payload: ConfirmPayload) {
    return this.http.post<Auth>(`${ BASE_URL }/auth/confirm`, payload);
  }

  saveAuth(auth: Auth) {
    localStorage.setItem(AUTH_KEY, auth.access_token ?? "");
  }

  getAccessToken() {
    return localStorage.getItem(AUTH_KEY);
  }

  cleanAuth() {
    localStorage.removeItem(AUTH_KEY)
  }
}
