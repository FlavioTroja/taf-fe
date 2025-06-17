export interface Municipality {
  id: string,
  city: string,
  province: string,
  region: string
}

export type PartialMunicipality = Partial<Municipality>;

export enum Role {
  USER = 'ROLE_USER',
  ADMIN = 'ROLE_ADMIN',
}

export interface MunicipalityFilters {
  value?: string
}
