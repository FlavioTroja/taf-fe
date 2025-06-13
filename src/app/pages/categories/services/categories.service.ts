import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { PartialCategory, Category, CategoryFilter } from "../../../models/Category";
import { Query } from "../../../../global";
import { PaginateDatasource } from "../../../models/Table";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  http = inject(HttpClient);

  addCategory(payload: PartialCategory) {
    return this.http.post<Category>(`${BASE_URL}/categories/create`, payload);
  }

  getCategory(id: number) {
    return this.http.get<Category>(`${BASE_URL}/categories/${id}`, { params: { populate: "parentCategory children" } });
  }

  editCategory(id: number, payload: PartialCategory) {
    const body = { ...payload, id: undefined };
    return this.http.patch<Category>(`${BASE_URL}/categories/${id}`, body);
  }

  deleteCategory(id: number) {
    return this.http.delete<Category>(`${BASE_URL}/categories/${id}`);
  }

  loadCategories(payload: Query<CategoryFilter>) {
    return this.http.post<PaginateDatasource<Category>>(`${BASE_URL}/categories`, payload);
  }

  loadAllCategories(payload: Query<CategoryFilter>) {
    return this.http.post<Category[]>(`${BASE_URL}/categories/all`, payload);
  }


}
