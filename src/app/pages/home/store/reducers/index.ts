import { ActionReducerMap, createFeatureSelector } from "@ngrx/store";
import { reducer as InvoiceStatisticsReducer } from "./invoiceStatistics.reducer";
import { reducer as OrderStatisticsReducer } from "./orderStatistics.reducer";
import { reducer as WarehouseStatisticsReducer } from "./warehouseStatistics.reducer";
import { reducer as httpErrorReducer } from "./http-error.reducer";
import { WarehouseStatisticsState } from "src/app/models/InventoryValues";
import { HttpError } from "../../../../models/Notification";
import { DefaultStatisticsGraph } from "src/app/models/ChartUtils";

export interface DashboardManagementState {
  invoiceStatistics?: Partial<DefaultStatisticsGraph>;
  orderStatistics?: Partial<DefaultStatisticsGraph>;
  warehouseStatistics?: Partial<WarehouseStatisticsState>;
  httpError?: Partial<HttpError>;
}

export const reducers: ActionReducerMap<DashboardManagementState> = {
  invoiceStatistics: InvoiceStatisticsReducer,
  orderStatistics: OrderStatisticsReducer,
  warehouseStatistics: WarehouseStatisticsReducer,
  httpError: httpErrorReducer,
}

export const selectDashboardManager = createFeatureSelector<DashboardManagementState>("dashboard-manager");
