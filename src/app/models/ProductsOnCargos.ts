import {Product} from "./Product";

export interface ProductsOnCargos {
  productId: number,
  product?: Product,
  cargoId: number,
  createdAt: Date | string,
  updatedAt: Date | string,
}

export type PartialProductsOnCargos = Partial<ProductsOnCargos>;

