// import { inject, Injectable } from "@angular/core";
// import { HttpClient } from "@angular/common/http";
// import { environment } from "../../environments/environment";
// import { PackingList, PartialPackingList, UpdatePackingListDTO } from "../models/PackingList";
//
//
// const BASE_URL = environment.BASE_URL;
// @Injectable({
//   providedIn: 'root'
// })
// export class PackingListService {
//   http = inject(HttpClient);
//
//   updatePackingListProducts(id: number, payload: UpdatePackingListDTO) {
//     return this.http.patch<PackingList>(`${BASE_URL}/packingLists/${id}/product`, payload);
//   }
//
//   updatePackingList(id: number, payload: PartialPackingList) {
//     payload = { ...payload, id: undefined };
//
//     return this.http.patch<PackingList>(`${BASE_URL}/packingLists/${id}`, payload);
//   }
//
// }
