import { environment } from "../../environments/environment";
import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AutocompleteAddress, PlaceDetail } from "../models/Address";

const BASE_URL = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class AddressesService {
  http = inject(HttpClient);

  getAddressesAutocomplete(payload: { searchAddress: string }) {
    return this.http.post<AutocompleteAddress[]>(`${BASE_URL}/google-api/places`, payload);
  }

  getAddressDetail(payload: string) {
    return this.http.get<PlaceDetail>(`${BASE_URL}/google-api/detail-address?placeId=${ payload }`);
  }

}
