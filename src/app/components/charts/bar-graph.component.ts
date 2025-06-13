import { AfterViewInit, Component, HostListener, Input, OnChanges } from '@angular/core';
import { BarSeriesOption, ECharts, EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { chartColorsArray, ChartData } from 'src/app/models/ChartUtils';

@Component({
  selector: 'app-bar-graph',
  standalone: true,
  imports: [ NgxEchartsDirective ],
  template: `
    <div [id]="'bar-graph-'+graphId" echarts [options]="options" [style.width]="'100%'" [style.height]="'100%'"></div>
  `,
  styles: [``],
  providers: [
    provideEcharts(),
  ]
})
export class BarGraphComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) graphId: string = '';
  /** this is the columns array, without this you won't have any bars, 
   * if you have 100 data and only X xAxis only the first X data will be rendered */
  @Input({ required: true }) xAxis: any[] = [];
  /** this is the data to be rendered into the chart */
  @Input({ required: true }) serieData: ChartData[] = [];
  /** function for formatting the tooltip text, not inserted == no tooltip */
  @Input({ required: false }) tooltipFormatter?: (params: any) => string;
  
  barGraph!: ECharts;
  options: EChartsOption = {
    color: chartColorsArray,  //< set color range for Chart series
    legend: {                 //< legend item, usefull if you actually want to have the legend/use the functions of a legend
      data: [],
      selected: {},
    },
    xAxis: {
      data: [],
    },
    yAxis: {},                //< those values will be set accordingly to the values, not as required as xAxis
    grid: {                   //< "padding" of the Chart
      top: "5%",
      left: "55px",
      right: "35px",
      bottom: "5%"
    },
    series: [],               //< data of the chart, has his own type depending on the type of the chart (e.g.: type = bar => series: BarSeriesOption)
  };

  defaultSeries: BarSeriesOption = {
    type: 'bar'
  }

  constructor() {}

  ngAfterViewInit(): void {
    //dom exists so it can get the graph
    this.barGraph = echarts.init(document.getElementById('bar-graph-'+this.graphId));

    if(!!this.tooltipFormatter) {
      this.options = {
        ...this.options,
        tooltip: {
          formatter: this.tooltipFormatter,
        },
      }
    }
  }

  ngOnChanges(changes: any): void {
    this.options = { 
      ...this.options, 
      xAxis: { 
        data: this.xAxis 
      }, 
      series: [{ 
        ...this.defaultSeries,
        data: this.serieData 
      }]
    };

    //update chart & render [always render after setting the options otherwise the chart won't have the changes due to it being a canvas]
    if(!!this.barGraph) {
      this.barGraph.setOption(this.options);
      this.barGraph.renderToCanvas();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.barGraph.resize();
  }
}