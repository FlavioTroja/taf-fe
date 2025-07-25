import { TooltipPosition } from "@angular/material/tooltip";

export interface Query<T> {
  query?: T,
  options?: QueryOptions
}

export interface QuerySearch {
  page: number,
  limit: number,
  search?: string,
  filters?: {
    municipalityId?: string,
    senderId?: string,
    recipientId?: string,
  },
  sort?: SortSearch
}

export interface SortSearch {
  [field: string]: 'asc' | 'desc';
}

export interface QueryOptions {
  limit?: number,
  page?: number,
  populate?: string,
  sort?: any[]
}

export interface ActiveEntity<T> {
  current: T,
  changes: Partial<T>
}

export interface DefaultQueryParams {
  populate?: string
}

export interface Section {
  id: number;
  code: string;
  toBeDisconnected?: boolean;
}

export interface UiButton {
  iconName: string,
  isLoading: boolean
}

export interface UIButtons {
  buttons: UiButton[]
}

export interface TooltipOpts {
  text: string,
  position?: TooltipPosition
}

export interface FilteredEntity<T, Q> {
  docs: T[];
  filters: QueryAll<Q>;
}

export interface QueryAll<T> {
  query?: T,
  populate?: string
}
