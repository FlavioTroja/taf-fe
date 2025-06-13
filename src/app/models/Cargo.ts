import { PartialProductsOnCargos } from "./ProductsOnCargos";
import { Warehouse } from "./Warehouse";
import { cargoType, MoveProductList } from "../pages/cargos/pages/bulk/create-bulk-cargos.component";
import { Product } from "./Product";
import { Supplier } from "./Supplier";
import { isNaN, isNil, omitBy, overSome } from "lodash-es";
import { Section } from "../../global";


export interface Cargo {
  id: number;
  supplierId: number;
  quantity: number;
  buyPrice: number;
  note?: string;
  fromWarehouseId?: number;
  toWarehouseId: number;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;

  products?: PartialProductsOnCargos[]
  toWarehouse: Warehouse
  fromWarehouse?: Warehouse
}

export type PartialCargo = Partial<Cargo>;

export interface CargoFilter {
  value?: string
}

export type BatchCargoSection = BatchCargo & Section;

export interface CargoBulk {
  changes: Partial<MoveProductList>,
  items: BatchCargoSection[]
}

export interface BatchCargo {
  productId: number,
  product?: Product,
  warehouseId: number,
  warehouse?: Warehouse,
  quantity: number,
  supplierId?: number,
  orderId?: number,
}

export interface BulkMoveProduct {
  productId: number
  product: Product | any,
  warehouseId: number,
  warehouse: Warehouse | any,
  supplierId: number,
  supplier: Supplier | any,
  quantityToMove: number,
  type: cargoType,
  products: BatchCargo[]
}

export function createBatchCargoPayload(cargoList: MoveProductList[]): BatchCargo[] {
  return cargoList.map(cargo => {
    return {
      warehouseId: cargo.currentWarehouseId,
      supplierId: cargo.currentSupplierId,
      productId: cargo.productId,
      warehouse: cargo.currentWarehouse,
      quantity: cargo.type === cargoType.CARICO ? +cargo.quantityToMove : -cargo.quantityToMove,
      type: cargo.type
    }
  })
}

export function createBulkMoveProductPayload(item: BulkMoveProduct): BulkMoveProductDTO {
  const bulkMoveProductDTO = {
    currentProductId: item.productId,
    currentProduct: item.product,
    currentWarehouseId: item.warehouseId,
    currentWarehouse: item.warehouse,
    currentSupplierId: item.supplierId,
    currentSupplier: item.supplier,
    quantityToMove: item.type === cargoType.CARICO ? +item.quantityToMove : -item.quantityToMove,
    type: item.type,
    products: item.products
  }

  return <BulkMoveProductDTO>omitBy(bulkMoveProductDTO, overSome([isNil, isNaN]));
}

export interface CargoTable {
  search?: string,
  pageIndex?: number,
  pageSize?: number
}

export type BulkMoveProductDTO = BulkMoveProduct

