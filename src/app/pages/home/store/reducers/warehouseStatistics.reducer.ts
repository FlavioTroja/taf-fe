import { Action, createReducer, on } from "@ngrx/store";
import * as DashboardActions from "../actions/dashboard.actions";
import { WarehouseStatisticsState } from "src/app/models/InventoryValues";


const initialState: Partial<WarehouseStatisticsState> = {
  history: {},
  last: []
}

const warehouseStatisticsReducer = createReducer(
  initialState,
  on(DashboardActions.getDashboardWarehouseStatisticsSuccess, (state, { warehouseStatistics }) => ({
    ...state,
    history: warehouseStatistics
  })),
  on(DashboardActions.getDashboardWarehouseLastStatisticSuccess, (state, { warehouseLastStatistic }) => ({
    ...state,
    last: warehouseLastStatistic
  }))
);

export function reducer(state: Partial<WarehouseStatisticsState> | undefined, action: Action) {
  return warehouseStatisticsReducer(state, action)
}
