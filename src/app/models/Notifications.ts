import { isNaN, isNil, omitBy, overSome } from "lodash-es";
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
    message: payload.message,
    read: payload.read,
    recipientId: payload.recipientId,
    senderId: payload.senderId,
    timestamp: payload.timestamp,
    municipalityId: payload.municipalityId,
  }

  return <Notification>omitBy(notificationDTO, overSome(isNil, isNaN))
}
