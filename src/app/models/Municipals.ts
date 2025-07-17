import { isNaN, isNil, omitBy, overSome } from "lodash-es";

export interface Municipal {
  id: string,
  city: string,
  province: string,
  region: string,
  domain: string
  icon: string,
  logo: string,
}

export type PartialMunicipal = Partial<Municipal>;

export function createMunicipalPayload(payload: any) {
  const municipalDTO = {
    city: payload.city,
    province: payload.province,
    region: payload.region,
    domain: payload.domain,
  }
  return <Municipal>omitBy(municipalDTO, overSome([ isNil, isNaN ]))
}
