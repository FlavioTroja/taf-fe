import { createSelector } from "@ngrx/store";
import { DashboardManagementState, selectDashboardManager } from "../reducers";

export const getDashboardInvoiceStatistics = createSelector(
  selectDashboardManager,
  (state?: DashboardManagementState) => state?.invoiceStatistics || {}
);

export const getDashboardOrderStatistics = createSelector(
  selectDashboardManager,
  (state?: DashboardManagementState) => state?.orderStatistics || {}
);

export const getDashboardWarehouseStatistics = createSelector(
  selectDashboardManager,
  (state?: DashboardManagementState) => state?.warehouseStatistics?.history || {} 
);

export const getDashboardWarehouseLastStatistic = createSelector(
  selectDashboardManager,
  (state?: DashboardManagementState) => state?.warehouseStatistics?.last || []
);