import { isNaN, omitBy, overSome } from "lodash-es";
import { PartialUser } from "./User";

export interface Notification {
  id: string;
  version: number;
  message: string;
  read: boolean;
  recipientId: string;
  senderId: string;
  timestamp: number;
  municipalityId: string;

  recipient?: PartialUser;
}

export type PartialNotification = Partial<Notification>;


export const createNotificationPayload = (payload: any) => {
  const notificationDTO = {
    message: payload.message || null,
    read: payload.read || null,
    recipientId: payload.recipientId || null,
    senderId: payload.senderId || null,
    timestamp: payload.timestamp || null,
    municipalityId: payload.municipalityId,
  }

  return <Notification>omitBy(notificationDTO, overSome(isNaN))
}
