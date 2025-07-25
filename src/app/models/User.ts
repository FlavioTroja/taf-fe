import { isNaN, isNil, omitBy, overSome } from "lodash-es";

export enum Roles {
  USER = "USER",
  ADMIN = "ADMIN",
  WORKER = "WORKER",
  GOD = "GOD",
  OVERZOOM = "OVERZOOM",
  USER_INSPECTOR = "USER_INSPECTOR",
  USER_COMMERCIAL = "USER_COMMERCIAL",
  USER_PLANNER = "USER_PLANNER",
  WORKER_DESIGNER = "WORKER_DESIGNER",
  WORKER_PRINTER = "WORKER_PRINTER",
  WORKER_FINISHER = "WORKER_FINISHER",
  WORKER_ASSEMBLER = "WORKER_ASSEMBLER",
}

export enum Roles {
  ROLE_USER = 'ROLE_USER',
  ROLE_ADMIN = 'ROLE_ADMIN',
}

export const RolesArray = [
  Roles.ROLE_USER, Roles.ROLE_ADMIN
]


export interface Role {
  id?: number;
  isActive: boolean;
  roleName: Roles
  userId: number;
}

export interface RoleName {
  name: string,
  label: string,
  rank: number,
  isActive: boolean,
}

export interface User {
  id: string,
  userId: string,
  name: string,
  surname: string,
  birthDate: string,
  photo: string,
  roles: Roles[]
  municipalityId: string
}

export type PartialUser = Partial<User>;

function createRolesPayload(initRoles: Role[], newRoles: Roles[]) {
  const roles = newRoles.map(role => ({
    id: initRoles.find(r => r.roleName === role)?.id || -1,
    roleName: role
  })) || [];

  const deleted = initRoles
    .filter(r => !roles.find(role => role.roleName === r.roleName))
    .map(r => ({ ...r, toBeDisconnected: true }));

  return [ ...roles, ...deleted ];
}

export function createUserPayload(user: any, initialRoles: Role[]): PartialUser {
  const userDto = {
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    password: user.password,
    roles: createRolesPayload(initialRoles, user.roles ?? []),
  }
  return <any>omitBy(userDto, overSome([ isNil, isNaN ]));
}

export interface UserFilter {
  value?: string
}

export function findRoleLabel(rolesNames: RoleName[], role: Roles | string): string {
  return rolesNames.find((roleName) => roleName.name === role)?.label ?? "";
}
