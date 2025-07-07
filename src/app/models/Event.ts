import { isNaN, isUndefined, omitBy, overSome } from "lodash-es";
import { PartialActivity } from "./Activities";

export interface Event {
  id: string
  version: number,
  title: string,
  startDateTime: string,
  endDateTime: string,
  location: string,
  photos: string[],
  cover: string,
  organizer: string,
  contactEmail: string,
  contactPhone: string,
  activityId: string,
  maxParticipants: number,
  currentParticipants: number,
  isPublic: boolean,
  isCancelled: boolean,
  url: string,
  participants: string[],
  checkInTimes: object,
  description: string,
  type: EventType,
  tags: string[],
  municipalityId: string,

  activity?: PartialActivity
}

export type PartialEvent = Partial<Event>;

export enum EventType {
  CONCERTO = "CONCERT",
  ESIBIZIONE = "EXHIBITION",
  WORKSHOP = "WORKSHOP",
  FESTIVAL = "FESTIVAL",
  EVENTO_SPORTIVO = "SPORT_EVENT",
  TEATRO = "THEATER",
  VISIONE_FILM = "MOVIE_SCREENING",
  ALTRO = "OTHER"
}

export function createEventPayload(payload: any) {
  const eventDTO = {
    title: payload.title,
    startDateTime: payload.startDateTime,
    endDateTime: payload.endDateTime,
    location: payload.location,
    photos: payload.photos,
    cover: payload.cover,
    organizer: payload.organizer,
    contactEmail: payload.contactEmail,
    contactPhone: payload.contactPhone,
    activityId: payload.activity?.id,
    maxParticipants: payload.maxParticipants !== '' ? +payload.maxParticipants : null,
    currentParticipants: payload.currentParticipants !== '' ? +payload.currentParticipants : null,
    isPublic: payload.isPublic,
    isCancelled: payload.isCancelled,
    url: payload.url,
    participants: payload.participants,
    checkInTimes: payload.checkInTimes,
    description: payload.description,
    type: payload.type,
    tags: payload.tags,
    municipalityId: payload.municipalityId,
  }

  return <Event>omitBy(eventDTO, overSome([ isUndefined, isNaN ]))
}

export const EVENT_TYPES = Object.entries(EventType).map(([ name, value ]) => ({
  value: value,
  label: name
    .toLowerCase()
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}));


export const getEventTypeName = (value: EventType) => {
  const keys = Object.keys(EventType) as Array<keyof typeof EventType>;

  const foundKey = keys.find(key => EventType[key] === value);

  if (!foundKey) {
    return '';
  }

  return foundKey.toLowerCase()
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
