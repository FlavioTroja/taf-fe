import { Roles } from "../../../models/User";

export interface RouteElement {
  iconName: string,
  label: string,
  path: string,
  provideRoles?: Roles[],
  roleSelector?: string,
  children?: Omit<RouteElement, "children">[],
  isLast?: boolean,
  isOpenOnly?: boolean,
}

export const sidebarRoutes: RouteElement[] = [
  {
    iconName: "home",
    path: '/home',
    label: "Dashboard",
    children: [],
    isLast: true,
  },
  {
    iconName: 'location_city',
    path: '/municipals',
    label: "Comuni",
    provideRoles: [ Roles.ROLE_ADMIN ]
  },
  {
    iconName: 'overview',
    path: '/activities',
    label: "Attività",
  },
  {
    iconName: 'campaign',
    path: '/news',
    label: "News",
  },
  {
    iconName: 'calendar_add_on',
    path: '/events',
    label: "Eventi",
  }
];
