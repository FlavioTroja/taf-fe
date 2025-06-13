import { isNil, omitBy, overSome, isNaN } from "lodash-es";
import { Warehouse } from "./Warehouse";
import { Category } from "./Category";
import { UnitMeasure } from "./UnitMeasure";

export interface BuyingPrice {
  quantity: number,
  price: number,
  vat: number,
  date: Date | string
}

export interface Product {
  id: number,
  sku: string,
  name: string,
  note?: string,
  description?: string,
  ean: string,
  image?: string,
  gallery: string[],
  yellowThreshold?: number,
  redThreshold?: number,
  weight?: number,
  size?: Partial<ProductSize>,
  umId?: number,
  um?: UnitMeasure,
  sellingPrice: number,
  vat: number,
  buyingPrices: BuyingPrice[],
  warehouseUm?: UnitMeasure,

  warehouses?: WarehousesList[],
  categories?: ProductsOnCategories[],

  createdAt: Date | string,
  updatedAt: Date | string,
  deleted: boolean
}

export type PartialProduct = Partial<Product>;

export type ProductDTO = Product & {
  relations: any[]
}

export function createProductPayload(product: any, initCategory: ProductsOnCategories[]): ProductDTO {
  const productDTO = {
    name: product.name,
    sku: product.sku,
    ean: product.ean,
    note: product.note,
    description: product.description,
    image: product.image,
    gallery: product.gallery,
    yellowThreshold: +product.yellowThreshold,
    redThreshold: +product.redThreshold,
    size: product?.size ? {
      width: product.size?.width! ? +product.size.width : undefined,
      height: product.size?.height! ? +product.size.height : undefined,
      length: product.size?.length! ? +product.size.length : undefined,
      string: product.size?.string! ? product.size.string : undefined,
      integer: product.size?.integer! ? +product.size.integer : undefined,
      float: product.size?.float! ? +product.size.float : undefined
    }: undefined,
    length: +product.length,
    width: +product.width,
    height: +product.height,
    weight: +product.weight,
    umId: product.umId ? +product.umId : undefined,
    warehouseUmId: product.warehouseUmId ? +product.warehouseUmId : undefined,
    sellingPrice: +product.sellingPrice,
    vat: +product.vat,
    buyingPrices: product.buyingPrice ? [{ price: +product.buyingPrice.price, quantity: +product.buyingPrice.quantity, vat: +product.buyingPrice.vat }] : undefined,

    warehouse: product.warehouse && product.warehouse?.warehouseId !== -1 ? { warehouseId: +product.warehouse.warehouseId, quantity: +product.warehouse.quantity } : undefined,
    categories: createCategoriesPayload(initCategory, product.categories || []),
  }
  return <ProductDTO>omitBy(productDTO, overSome([isNil, isNaN]));
}

export interface ProductTable {
  search?: string,
  categories?: string,
  warehouses?: string,
  suppliers?: string,
  thresholds?: string,
  pageIndex?: number,
  pageSize?: number
}

function createCategoriesPayload(initCategories: ProductsOnCategories[], newCategories: number[]) {
  const categories = newCategories.map(catId => ({
    id: initCategories.find(c => c.categoryId === catId)?.id || -1,
    categoryId: catId
  })) || [];

  const deleted = initCategories
    .filter(c => !categories.find(cat => cat.categoryId === c.categoryId))
    .map(c => ({ ...c, toBeDisconnected: true }));

  return [ ...categories, ...deleted ];
}

export interface MoveProductDTO {
  productId: number
  currentWarehouseId: number
  quantityToMove: number,
  destinationWarehouseId?: number,
  orderId?: number,
  note?: string,
}

export interface WarehousesList {
  productId: number,
  warehouseId: number,
  quantity: number,
  warehouse?: Warehouse
}

export interface ProductsOnCategories {
  id: number,
  productId: number,
  categoryId: number,
  category?: Category
}

export interface ProductFilter {
  value?: string,
  categories?: number[],
  warehouses?:  number[],
  suppliers?:  number[],
  underYellowThreshold?: boolean,
  underRedThreshold?: boolean,
}

interface ProductSize {
  width?: number,
  height?: number,
  length?: number,
  float?: number,
  integer?: number,
  string?: string
}


export const productThresholdArray = [
  { id: 0, name: "rossa", field: "underRedThreshold" },
  { id: 1, name: "gialla", field: "underYellowThreshold" }
];
