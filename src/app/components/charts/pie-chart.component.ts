import { AfterViewInit, Component, HostListener, Input, OnChanges } from '@angular/core';
import { ECharts, EChartsOption, PieSeriesOption } from 'echarts';
import * as echarts from 'echarts';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { chartColorsArray, ChartData } from 'src/app/models/ChartUtils';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [ NgxEchartsDirective ],
  template: `
    <div [id]="'pie-chart-'+chartId" echarts [options]="options" [style.width]="'100%'" [style.height]="'100%'"></div>
  `,
  styles: [``],
  providers: [
    provideEcharts(),
  ]
})
export class PieChartComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) chartId: string = '';
  /** this is the data to be rendered into the chart, needs value + name*/
  @Input({ required: true }) serieData: ChartData[] = [];
  /** add the default tooltip to the graph */
  @Input({ required: false }) useDefaultTooltip?: boolean;
  /** function for formatting the tooltip text, if you want the default set 'useDefaultTooltip' to true*/
  @Input({ required: false }) customTooltipFormatter?: (params: any) => string;
  /** make the pie a donut (hollow in the middle) */
  @Input({ required: false }) donut?: boolean;
  
  pieChart!: ECharts;
  options: EChartsOption = {
    color: chartColorsArray,  //< set color range for Chart series
    legend: {                 //< legend item, usefull if you actually want to have the legend/use the functions of a legend
      data: [],
      selected: {},
    },
    grid: {                   //< "padding" of the Chart
      top: "5%",
      left: "55px",
      right: "35px",
      bottom: "5%"
    },
    series: [],
  };

  defaultSeries: PieSeriesOption = {
    type: 'pie'
  }

  constructor() {}

  ngAfterViewInit(): void {
    //dom exists so it can get the chart
    this.pieChart = echarts.init(document.getElementById('pie-chart-'+this.chartId));

    if(this.useDefaultTooltip) {
      this.options = {
        ...this.options,
        tooltip: {}
      }
    }

    if(!!this.customTooltipFormatter) {
      this.options = {
        ...this.options,
        tooltip: {
          formatter: this.customTooltipFormatter,
        },
      }
    }

    if(this.donut) {
      this.defaultSeries = {
        ...this.defaultSeries,
        radius: [30, 110]
      }
    }
  }

  ngOnChanges(changes: any): void {
    this.options = { 
      ...this.options, 
      series: [{
        ...this.defaultSeries,
        data: this.serieData
      }]
    };

    //update chart & render [always render after setting the options otherwise the chart won't have the changes due to it being a canvas]
    if(!!this.pieChart) {
      this.pieChart.setOption(this.options);
      this.pieChart.renderToCanvas();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.pieChart.resize();
  }
}