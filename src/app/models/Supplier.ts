import { isNaN, isNil, omitBy, overSome } from "lodash-es";
import { Address } from "./Address";

export interface Supplier {
  id: number,
  name: string,
  code: string,
  email?: string,
  phone?: string,
  address?: Address,
  city?: string,
  iban?: string,
  createdAt: Date | string,
  updatedAt: Date | string,
  deleted: boolean
}

export type PartialSupplier = Partial<Supplier>;

export function createSupplierPayload(supplier: any): Supplier {
  const supplierDTO = {
    name: supplier.name,
    code: supplier.code,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    city: supplier.city,
    iban: supplier.iban
  };
  return <Supplier>omitBy(supplierDTO, overSome([isNil, isNaN]));
}

export interface SupplierTable {
  search?: string,
  pageIndex?: number,
  pageSize?: number
}

export interface SupplierFilter {
  value?: string,
}
