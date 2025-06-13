import { ChartData, ChartSerie, periodFractionEnum } from "./ChartUtils";

export interface InventoryValuesStatisticsRequest {
  from: string,
  to: string,
  periodFraction: periodFractionEnum
}

export interface InventoryValuesStatisticsResponse {
  periodFraction: string,       //xAxis
  totalValue: string,           //of all the warehouses
  totalItems: string,           //of all the warehouses
  valueDistribution: ValueDistribution[]
};

export interface InventoryValuesLastStatisticResponse {
  value: string,                //of all the warehouses
  valueDistribution: ValueDistribution[]
  numberOfItems: string,        //of all the warehouses
  strategy: string,             //should be an ENUM 
  requestOrigin: string,        //should be an ENUM 
  createdAt: string,
  updatedAt: string
};

export interface ValueDistribution {
  warehouseId: string,
  warehouseName: string,
  value: string,                //of the current warehouse
  numberOfItems: string         //of the current warehouse
};

export interface InventoryValuesStatisticsGraph {
  xAxis: string[],
  serieData: ChartSerie[]
};

export interface WarehouseStatisticsState {
  last: ChartData[],
  history: Partial<InventoryValuesStatisticsGraph>
}