import { isNaN, isNil, omitBy, overSome } from "lodash-es";

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
    name: activity.name,
    address: activity.address,
    latitude: activity.latitude ? +activity.latitude : undefined,
    longitude: activity.longitude ? +activity.longitude : undefined,
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
    municipalityId: activity.municipalityId,
  }

  return <Activity>omitBy(activityDTO, overSome([ isNil, isNaN ]))
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

  if (!foundKey) {
    return '';
  }

  return foundKey
    .toLowerCase()
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
