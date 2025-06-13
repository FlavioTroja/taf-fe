import { Product } from "./Product";
import { Warehouse } from "./Warehouse";

export interface ProductsOnWarehouses {
  productId: number,
  warehouseId: number,
  quantity: number,
  createdAt: Date | string,
  updatedAt: Date | string
  product?: Product
  warehouse?: Warehouse
}

export type PartialProductsOnWarehouses = Partial<ProductsOnWarehouses>
