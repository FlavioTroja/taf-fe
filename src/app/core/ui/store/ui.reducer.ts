import { Action, createReducer, on } from "@ngrx/store";
import * as UIActions from "./ui.actions";
import { Notification } from "../../../models/Notification";
import { generateRandomCode } from "../../../../utils/utils";

export interface SidebarState {
  collapsed: boolean,
  expand?: {
    path: string
  }
}

export interface NavbarState {
  page: {
    title: string,
    buttons?: {
      label: string,
      iconName: string,
      action: string
    }[]
  }
}

export interface UIState {
  sidebar: SidebarState;
  notifications: Notification[];
}

export const initialState: UIState = {
  sidebar: {
    collapsed: false,
    expand: undefined
  },
  notifications: []
}

const sidebarReducer = createReducer(
  initialState,
  on(UIActions.uiToggleSidebarCollapsed, (state) => ({
    ...state,
    sidebar: {
      ...state.sidebar,
      collapsed: !state.sidebar.collapsed
    },
  })),
  on(UIActions.uiSetSidebarCollapseState, (state, { value }) => ({
    ...state,
    sidebar: {
      ...state.sidebar,
      collapsed: value
    },
  })),
  on(UIActions.uiToggleSidebarExpandRoute, (state, { expand }) => ({
    ...state,
    sidebar: {
      ...state.sidebar,
      expand: expand ? { ...expand } : undefined
    },
  })),
  on(UIActions.setUiNotification, (state, { notification }) => {
    const current = [ ...state.notifications ];
    current.push({
      ...notification,
      code: generateRandomCode()
    });

    return {
      ...state,
      notifications: current
    };
  }),
  on(UIActions.removeSelectedNotification, (state, { code }) => ({
    ...state,
    notifications: [ ...state.notifications ].filter(n => n.code !== code)
  })),
  on(UIActions.clearUINotification, (state) => ({
    ...state,
    notifications: []
  }))
);

export function reducer(state: UIState | undefined, action: Action) {
  return sidebarReducer(state, action);
}
