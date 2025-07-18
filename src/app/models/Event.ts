import { isNaN, omitBy, overSome } from "lodash-es";
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
    title: payload.title || null,
    startDateTime: payload.startDateTime || null,
    endDateTime: payload.endDateTime || null,
    location: payload.location || null,
    photos: payload.photos || null,
    cover: payload.cover || null,
    organizer: payload.organizer || null,
    contactEmail: payload.contactEmail || null,
    contactPhone: payload.contactPhone || null,
    activityId: payload.activity?.id || null,
    maxParticipants: payload.maxParticipants || +payload.maxParticipants,
    currentParticipants: payload.currentParticipants || +payload.currentParticipants,
    isPublic: payload.isPublic || null,
    isCancelled: payload.isCancelled || null,
    url: payload.url || null,
    participants: payload.participants || null,
    checkInTimes: payload.checkInTimes || null,
    description: payload.description || null,
    type: payload.type || null,
    tags: payload.tags || null,
    municipalityId: payload.municipalityId,
  }

  return <Event>omitBy(eventDTO, overSome([ isNaN ]))
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

  if ( !foundKey ) {
    return '';
  }

  return foundKey.toLowerCase()
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
