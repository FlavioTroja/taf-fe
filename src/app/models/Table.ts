import { TemplateRef } from "@angular/core";
import { TooltipOpts } from "../../global";
import { Roles } from "./User";

export interface PaginateDatasource<T> {
  content: T[]
  totalDocs: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
  page: number
  limit: number
  prevPage: number
  nextPage: number
}

export interface Table {
  pageIndex: number,
  pageSize: number
}

export interface Sort {
  active: string,
  direction: "asc" | "desc"
}

export interface TableButton<T> {
  iconName: string;
  bgColor: string;
  tooltipOpts?: TooltipOpts

  disabled?: (elem: T) => boolean;
  provideRoles?: Roles[];
  callback?: (elem: T) => void;
}

export interface TableColumn<T> {
  columnDef: string,
  header: string,
  width: number,
  cell?: (e: T) => string,
  template?: TemplateRef<any>,
  sortable: boolean
}
