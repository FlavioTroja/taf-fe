import { TemplateRef } from "@angular/core";
import { Roles } from "./User";
import { TooltipOpts } from "../../global";

export interface PaginateDatasource<T> {
  docs: T[]
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
