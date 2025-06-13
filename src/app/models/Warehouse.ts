import { ProductsOnWarehouses } from "./ProductsOnWarehouses";
import { PaginateDatasource } from "./Table";
export interface Warehouse {
  id: number,
  name: string,
  address: string,
  plate: string,
  isPrimary: boolean,
  createdAt: Date | string,
  updatedAt: Date | string,
  deleted: boolean,

  products?: PaginateDatasource<ProductsOnWarehouses>
}

export interface WarehouseTable {
  search?: string,
  pageIndex?: number,
  pageSize?: number
}

export type PartialWarehouse = Partial<Warehouse>
