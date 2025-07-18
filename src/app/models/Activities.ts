import { isNaN, omitBy, overSome } from "lodash-es";

export interface Activity {
  id: string
  version: number,
  name: string,
  address: string,
  latitude: number,
  longitude: number,
  phone: string,
  photos: string[],
  cover: string,
  logo: string,
  email: string,
  openingHours: string[],
  website: string,
  description: string,
  type: ActivitiesType,
  tags: string[],
  municipalityId: string
}

export type PartialActivity = Partial<Activity>;

export enum ActivitiesType {
  CIBO = "FOOD",
  CULTURA = "CULTURE",
  NATURE = "NATURE",
  SPORT = "SPORT",
  SHOPPING = "SHOPPING",
  NIGHTLIFE = "NIGHTLIFE",
  ALTRO = "OTHER"
}

export function createActivityPayload(activity: any) {
  const activityDTO = {
    name: activity.name || null,
    address: activity.address || null,
    latitude: activity.latitude || +activity.latitude,
    longitude: activity.longitude || +activity.longitude,
    phone: activity.phone || null,
    photos: activity.photos || null,
    cover: activity.cover || null,
    logo: activity.logo || null,
    email: activity.email || null,
    openingHours: activity.openingHours || null,
    website: activity.website || null,
    description: activity.description || null,
    type: activity.type || null,
    tags: activity.tags || null,
    municipalityId: activity.municipalityId,
  }

  return <Activity>omitBy(activityDTO, overSome([ isNaN ]))
}

export const ACTIVITY_TYPES = Object.entries(ActivitiesType).map(([ name, value ]) => ({
  value: value,
  label: name
    .toLowerCase()
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}));

export const getActivityTypeName = (value: ActivitiesType) => {
  const keys = Object.keys(ActivitiesType) as Array<keyof typeof ActivitiesType>;

  const foundKey = keys.find(key => ActivitiesType[key] === value);

  if ( !foundKey ) {
    return '';
  }

  return foundKey
    .toLowerCase()
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
