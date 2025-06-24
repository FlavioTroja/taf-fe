import { isNil, omitBy, overSome } from "lodash-es";

export interface Activity {
  id?: string
  version?: number,
  name: string,
  address?: string,
  phone?: string,
  photos?: string[],
  cover?: string,
  logo?: string,
  email?: string,
  openingHours?: string[],
  website?: string,
  description?: string,
  type?: ActivitiesType,
  tags?: string[],
  municipalityId?: string
}

export type PartialActivity = Partial<Activity>;

export enum ActivitiesType {
  FOOD = "FOOD",
  CULTURE = "CULTURE",
  NATURE = "NATURE",
  SPORT = "SPORT",
  SHOPPING = "SHOPPING",
  NIGHTLIFE = "NIGHTLIFE",
  OTHER = "OTHER"
}

export function createActivityPayload(activity: any) {
  const activityDTO = {
    name: activity.name,
    address: activity.address,
    phone: activity.phone,
    photos: activity.photos,
    cover: activity.cover,
    logo: activity.logo,
    email: activity.email,
    openingHours: activity.openingHours,
    website: activity.website,
    description: activity.description,
    type: activity.type,
    tags: activity.tags,
  }

  return omitBy(activityDTO, overSome([ isNil ]))
}

export const ACTIVITY_TYPES = Object.keys(ActivitiesType)
