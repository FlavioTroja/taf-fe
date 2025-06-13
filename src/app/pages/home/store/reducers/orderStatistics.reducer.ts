import { Action, createReducer, on } from "@ngrx/store";
import * as DashboardActions from "../actions/dashboard.actions";
import { DefaultStatisticsGraph } from "src/app/models/ChartUtils";


const initialState: Partial<DefaultStatisticsGraph> = {
  xAxis: [],
  serieData: []
}

const orderStatisticsReducer = createReducer(
  initialState,
  on(DashboardActions.getDashboardOrderStatisticsSuccess, (state, { orderStatistics }) => ({
    ...orderStatistics
  }))
);

export function reducer(state: Partial<DefaultStatisticsGraph> | undefined, action: Action) {
  return orderStatisticsReducer(state, action)
}
