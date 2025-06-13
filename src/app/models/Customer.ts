import { isNaN, isNil, omitBy, overSome } from "lodash-es";
import { Section } from "../../global";
import { Address } from "./Address";

export interface Customer {
  id: number,
  name: string,
  fiscalCode: string,
  vatNumber: string,
  sdiNumber: string,
  type: string,
  email: string,
  pec: string,
  phone: number,
  note?: number,
  addresses: Address[],
  createdAt: Date | string,
  updatedAt: Date | string,
  deleted: boolean,
}

export type PartialCustomer = Partial<Customer>;

export function createCustomerPayload(customer: any): CustomerDTO {
  const customerDTO = {
    id: customer.id,
    name: customer.name,
    fiscalCode: customer.fiscalCode,
    vatNumber: customer.vatNumber,
    sdiNumber: customer.sdiNumber,
    type: customer.type,
    email: customer.email,
    pec: customer.pec,
    phone: customer.phone,
    note: customer.note,
    addresses: customer.addresses?.filter((i: any) => Object.keys(i).length),
  }
  return <CustomerDTO>omitBy(customerDTO, overSome([isNil, isNaN]));
}

export interface CustomerTable {
  search?: string,
  typeValues?: string,
  pageIndex?: number,
  pageSize?: number
}

export type CustomerDTO = Customer

export type AddressOnCustomerSection = Partial<Address> & Section;

export enum CustomerType {
  PRIVATO = 'PRIVATO'
}

export const customerTypeArray = [
  { name: 'Privato', value: CustomerType.PRIVATO },
]

export interface CustomerFilter {
  value?: string,
  typeValues?: CustomerType[]
}

export interface DatePeriod {
  from: string,
  to: string
}
