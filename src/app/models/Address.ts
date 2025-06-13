export interface Address {
  id: number,
  country: string,
  state: string,
  province: string,
  city: string,
  zipCode: string,
  address: string,
  number: string,
  note?: string,
  billing: boolean,
  defaultShipping: boolean,
}

export type PartialAddress = Partial<Address>;

export interface AutocompleteAddress {
  placeId: string,
  text: string,
}

export interface PlaceDetail {
  country?: string,
  state?: string,
  province?: string,
  city?: string,
  zipCode?: string,
  address?: string,
  number?: string,
  formatted_address?: string,
}
