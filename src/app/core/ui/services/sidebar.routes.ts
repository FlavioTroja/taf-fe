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
    iconName: "road",
    path: "/inspections",
    label: "Allestimenti",
    isLast: true,
    isOpenOnly: true,
    children: [
      { iconName: "category_search", label: "Sopralluoghi", path: "/inspections", roleSelector: "sidebar.children.inspections" },
      { iconName: "assignment", label: "Schede tecniche", path: "/drafts", roleSelector: "sidebar.children.drafts" },
      { iconName: "work", label: "Il mio reparto", path: "/task-steps", roleSelector: "sidebar.children.task-steps" },
      { iconName: "service_toolbox", label: "Lavori avviati", path: "/tasks", roleSelector: "sidebar.children.tasks" },
      { iconName: "work_history", label: "Lavori conclusi", path: "/completed-tasks", roleSelector: "sidebar.children.completed-tasks" },
    ]
  },
  {
    iconName: "package_2",
    path: "/products",
    label: "Prodotti",
    isOpenOnly: true,
    children: [
      { iconName: "package_2", label: "Lista Prodotti", path: "/products" },
      { iconName: "category", label: "Categorie", path: "/categories" }
    ]
  },
  {
    iconName: "open_with",
    path: "/cargos",
    label: "Movimentazioni"
  },
  {
    iconName: "local_shipping",
    path: "/suppliers",
    label: "Fornitori",
    roleSelector: "sidebar.body.suppliers"
  },
  {
    iconName: "group",
    path: "/customers",
    label: "Clienti",
  },
  {
    iconName: "person",
    path: "/resources",
    label: "Risorse",
    roleSelector: "sidebar.body.resources",
  },
];
