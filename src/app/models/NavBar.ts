import { MemoizedSelector } from "@ngrx/store";
import { TooltipOpts } from "../../global";
import { ModalButton } from "./Button";

export enum NAVBAR_ACTION {

  HOME = "HOME",

  // Municipality section
  MUNICIPAL_SAVE = "MUNICIPAL_SAVE",

  USERS_CREATE = "USERS_CREATE",
  USERS_EDIT = "USERS_EDIT",
  USERS_DELETE = "USERS_DELETE",

  // Users section
  USER_SAVE = "USER_SAVE",
  USER_NAVIGATE_ON_MODIFY = "USER_NAVIGATE_ON_MODIFY",
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
