export interface Municipal {
  id: string,
  city: string,
  province: string,
  region: string
}

export type PartialMunicipal = Partial<Municipal>;
