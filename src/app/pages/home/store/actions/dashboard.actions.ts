import { createAction, props } from "@ngrx/store";
import { ChartData, DefaultStatisticsGraph, DefaultStatisticsRequest } from "src/app/models/ChartUtils";
import { InventoryValuesStatisticsGraph, InventoryValuesStatisticsRequest } from "src/app/models/InventoryValues";
import { HttpError } from "src/app/models/Notification";

export const getDashboardInvoiceStatistics = createAction("[Dashboard] Get invoice statistics", props<{ params: DefaultStatisticsRequest }>());
export const getDashboardInvoiceStatisticsSuccess = createAction("[Dashboard] Get invoice statistics Success", props<{ invoiceStatistics: DefaultStatisticsGraph }>());
export const getDashboardInvoiceStatisticsFailed = createAction("[Dashboard] Get invoice statistics Failed", props<{ error: HttpError }>());

export const getDashboardWarehouseStatistics = createAction("[Dashboard] Get warehouse statistics", props<{ params: InventoryValuesStatisticsRequest }>());
export const getDashboardWarehouseStatisticsSuccess = createAction("[Dashboard] Get warehouse statistics Success", props<{ warehouseStatistics: InventoryValuesStatisticsGraph }>());
export const getDashboardWarehouseStatisticsFailed = createAction("[Dashboard] Get warehouse statistics Failed", props<{ error: HttpError }>());

export const getDashboardWarehouseLastStatistic = createAction("[Dashboard] Get warehouse last statistic");
export const getDashboardWarehouseLastStatisticSuccess = createAction("[Dashboard] Get warehouse last statistic Success", props<{ warehouseLastStatistic: ChartData[] }>());
export const getDashboardWarehouseLastStatisticFailed = createAction("[Dashboard] Get warehouse last statistic Failed", props<{ error: HttpError }>());

export const getDashboardOrderStatistics = createAction("[Dashboard] Get order statistics", props<{ params: DefaultStatisticsRequest }>());
export const getDashboardOrderStatisticsSuccess = createAction("[Dashboard] Get order statistics Success", props<{ orderStatistics: DefaultStatisticsGraph }>());
export const getDashboardOrderStatisticsFailed = createAction("[Dashboard] Get order statistics Failed", props<{ error: HttpError }>());