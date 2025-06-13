import { Action, createReducer, on } from "@ngrx/store";
import * as DashboardActions from "../actions/dashboard.actions";
import { DefaultStatisticsGraph } from "src/app/models/ChartUtils";


const initialState: Partial<DefaultStatisticsGraph> = {
  xAxis: [],
  serieData: []
}

const invoiceStatisticsReducer = createReducer(
  initialState,
  on(DashboardActions.getDashboardInvoiceStatisticsSuccess, (state, { invoiceStatistics }) => ({
    ...invoiceStatistics
  }))
);

export function reducer(state: Partial<DefaultStatisticsGraph> | undefined, action: Action) {
  return invoiceStatisticsReducer(state, action)
}
