
export interface ShippingInfo {
  state: string, // Italy
  region: string, // Puglia
  province: string, // BT
  postalCode: string, // 12345
  city: string, // Milan
  address: string, // Via green
  civicNumber: string, /// 79
  notes?: string
}

export type PartialShippingInfo = Partial<ShippingInfo>;
