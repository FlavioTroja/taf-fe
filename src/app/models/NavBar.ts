import { MemoizedSelector } from "@ngrx/store";
import { TooltipOpts } from "../../global";
import { ModalButton } from "./Button";

export enum NAVBAR_ACTION {

  HOME = "HOME",

  MUNICIPAL_SAVE = "MUNICIPAL_SAVE",
  ACTIVITY_SAVE = "ACTIVITY_SAVE",
  NEWS_SAVE = "NEWS_SAVE",
  EVENT_SAVE = "EVENT_SAVE",
  NOTIFICATION_SAVE = "NOTIFICATION_SAVE",

  // Users section
  USER_SAVE = "USER_SAVE",
  USER_NAVIGATE_ON_MODIFY = "USER_NAVIGATE_ON_MODIFY",
  ACTIVITY_NAVIGATE_ON_MODIFY = "ACTIVITY_NAVIGATE_ON_MODIFY",
  NEWS_NAVIGATE_ON_MODIFY = "NEWS_NAVIGATE_ON_MODIFY",
  EVENTS_NAVIGATE_ON_MODIFY = "EVENTS_NAVIGATE_ON_MODIFY",
  SENT_NOTIFICATIONS_NAVIGATE_ON_MODIFY = "SENT_NOTIFICATIONS_NAVIGATE_ON_MODIFY",
  RECEIVED_NOTIFICATIONS_NAVIGATE_ON_MODIFY = "RECEIVED_NOTIFICATIONS_NAVIGATE_ON_MODIFY",
}

export interface NavBarButton<T, Q> {
  label: string;
  iconName: string;
  action: string;
  navigate?: string;
  tooltipOpts?: TooltipOpts;
  dialog?: NavBarButtonDialog<T, Q>;
  selectors?: {
    hidden?: MemoizedSelector<T, Q>,
    disabled?: MemoizedSelector<T, Q>,
    isLoading?: MemoizedSelector<T, Q>,
  };
  roleSelector?: string;
}

export interface NavBarButtonDialog<T, Q> {
  title: string;
  content: MemoizedSelector<T, Q>;
  action: NAVBAR_ACTION;
  buttons?: ModalButton<T, Q>[];
}
