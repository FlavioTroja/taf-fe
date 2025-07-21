import { isNaN, omitBy, overSome } from "lodash-es";

export interface Municipal {
  id: string,
  city: string,
  province: string,
  region: string,
  domain: string
  icon: string,
  cover: string,
  logo: string,
}

export type PartialMunicipal = Partial<Municipal>;

export function createMunicipalPayload(payload: any) {
  const municipalDTO = {
    city: payload.city || null,
    province: payload.province || null,
    region: payload.region || null,
    domain: payload.domain || null,
    description: payload.description || null,
  }
  return <Municipal>omitBy(municipalDTO, overSome([ isNaN ]))
}
