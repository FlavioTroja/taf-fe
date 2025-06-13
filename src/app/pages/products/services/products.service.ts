import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { BuyingPrice, MoveProductDTO, PartialProduct, Product, ProductFilter } from "../../../models/Product";
import { DefaultQueryParams, Query } from "../../../../global";
import { PaginateDatasource } from "../../../models/Table";
import { BatchCargo, Cargo } from "../../../models/Cargo";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  http = inject(HttpClient);

  addProduct(payload: PartialProduct) {
    const newPayload = {
      ...payload,
      id: undefined,
      categories: payload.categories?.filter(c => c.categoryId !== 0).map(c => ({ ...c, id: undefined })),
    }

    return this.http.post<Product>(`${BASE_URL}/products/create`, newPayload);
  }

  getProduct(id: number, params?: DefaultQueryParams) {
    return this.http.get<Product>(`${BASE_URL}/products/${id}`, { params: { ...params } });
  }

  editProduct(id: number, payload: PartialProduct) {
    const body = { ...payload, id: undefined };
    return this.http.patch<Product>(`${BASE_URL}/products/${id}`, body);
  }

  editProductPrice(id: number, payload: Partial<BuyingPrice>) {
    return this.http.patch<Product>(`${BASE_URL}/products/prices/${id}`, payload);
  }

  deleteProduct(id: number) {
    return this.http.delete<Product>(`${BASE_URL}/products/${id}`);
  }

  loadProducts(payload: Query<ProductFilter>) {
    return this.http.post<PaginateDatasource<Product>>(`${BASE_URL}/products`, payload);
  }

  // change into all
  loadAllProducts(payload: Query<ProductFilter>) {
    return this.http.post<PaginateDatasource<Product>>(`${BASE_URL}/products`, payload);
  }

  moveProduct(payload: MoveProductDTO) {
    return this.http.post<Cargo>(`${BASE_URL}/products/move`, payload);
  }

  moveBulk(payload: {products: BatchCargo[]}) {
    return this.http.post<{ productId: number, done: boolean }[]>(`${BASE_URL}/products/move/bulk`, [ ...payload.products ]);
  }

  getProductQuantityRemain(productId: string, warehouseId: string) {
    return this.http.get<{ quantity: number }>(`${BASE_URL}/products/${productId}/warehouse/${warehouseId}/quantity/remain`);
  }


}
