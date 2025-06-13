import { DateTime } from "luxon";

/**
 * @DAILY returns MAX 90 days
 * @MONTHLY returns MAX 90 months
 * @YEARLY returns MAX 20 years
 */
export enum periodFractionEnum {
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

//this will be in the class of the various charts calls
export const chartColorsArray = [
  '#53ABDE', 
  '#70C995', 
  '#EEA549', 
  '#E54F47', 
  '#195A80', 
  '#2B7349', 
  '#EA6A1A', 
  '#9747FF'
];

export interface ChartData {
  value: number,
  name?: string
};

export interface ChartSerie {
  name: string,
  data: ChartData[]
};

export interface LegendItem {
  seriesIndex: number;
  seriesName: string;
  seriesColor: any;
  seriesActive: boolean;
};

export interface ChartDateInterval {
  header: string, 
  timeJump: string, 
  periodFraction: periodFractionEnum 
};

export interface DefaultStatisticsRequest {
  from: string,
  to: string,
  periodFraction: periodFractionEnum
}

export interface DefaultStatisticsResponse {
  periodFraction: string,
  max: number,
  min: number,
  sum: number
}

export interface DefaultStatisticsGraph {
  xAxis: string[],
  serieData: ChartData[]
}

//this is for the dateIntervall filter selector one daily
export const dateIntervalArray: ChartDateInterval[] = [
  {
    header: "Ultimo trimestre",
    timeJump: DateTime.now().startOf('month').minus({ months: 2 }).toISO({ includeOffset: false }) || "",
    periodFraction: periodFractionEnum.DAILY
  },
  {
    header: "Ultimo semestre",
    timeJump: DateTime.now().startOf('month').minus({ months: 5 }).toISO({ includeOffset: false }) || "",
    periodFraction: periodFractionEnum.MONTHLY
  },
  {
    header: "Ultimo anno",
    timeJump: DateTime.now().startOf('year').toISO({ includeOffset: false }) || "",
    periodFraction: periodFractionEnum.MONTHLY
  },
  {
    header: "Ultimo biennio",
    timeJump: DateTime.now().startOf('year').minus({ years: 1 }).toISO({ includeOffset: false }) || "",
    periodFraction: periodFractionEnum.MONTHLY
  },
  {
    header: "Ultimo triennio",
    timeJump: DateTime.now().startOf('year').minus({ years: 2 }).toISO({ includeOffset: false }) || "",
    periodFraction: periodFractionEnum.MONTHLY
  }
];

//this is for the dateIntervall filter selector all monthly
export const dateIntervalArrayAllMonthly: ChartDateInterval[] = [
  {
    header: "Ultimo trimestre",
    timeJump: DateTime.now().startOf('month').minus({ months: 2 }).toISO({ includeOffset: false }) || "",
    periodFraction: periodFractionEnum.MONTHLY
  },
  {
    header: "Ultimo semestre",
    timeJump: DateTime.now().startOf('month').minus({ months: 5 }).toISO({ includeOffset: false }) || "",
    periodFraction: periodFractionEnum.MONTHLY
  },
  {
    header: "Ultimo anno",
    timeJump: DateTime.now().startOf('year').toISO({ includeOffset: false }) || "",
    periodFraction: periodFractionEnum.MONTHLY
  },
  {
    header: "Ultimo biennio",
    timeJump: DateTime.now().startOf('year').minus({ years: 1 }).toISO({ includeOffset: false }) || "",
    periodFraction: periodFractionEnum.MONTHLY
  },
  {
    header: "Ultimo triennio",
    timeJump: DateTime.now().startOf('year').minus({ years: 2 }).toISO({ includeOffset: false }) || "",
    periodFraction: periodFractionEnum.MONTHLY
  }
];