import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { ECharts, EChartsOption, LineSeriesOption, SeriesModel, SeriesOption } from 'echarts';
import * as echarts from 'echarts';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { chartColorsArray, ChartData, ChartSerie, LegendItem } from 'src/app/models/ChartUtils';

@Component({
  selector: 'app-line-graph',
  standalone: true,
  imports: [ NgxEchartsDirective ],
  template: `
    <div [id]="'line-graph-'+graphId" echarts [options]="options" [style.width]="'100%'" [style.height]="'100%'"></div>
  `,
  styles: [``],
  providers: [
    provideEcharts(),
  ]
})
export class LineGraphComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) graphId: string = '';
  /** this is the columns array, without this you won't have any lines, 
      if you have 100 data and only X xAxis only the first X data will be rendered */
  @Input({ required: true }) xAxis: string[] = [];
  /** this is the data to be rendered into the chart can either be a ChartSerie[] || ChartData[] */
  @Input({ required: true }) serieData: ChartSerie[] | ChartData[] = [];
  /** function for formatting the tooltip text, not inserted == no tooltip */
  //@Input({ required: false }) tooltipFormatter?: (params: any) => string;
  /** receive legend name to toggle it's graph */
  @Input({ required: false }) toggleLegend: string = '';
  /** sends legends array for custom render */
  @Output() legendUpdateEvent: EventEmitter<LegendItem[]> = new EventEmitter();
  
  lineGraph!: ECharts;
  updateLegend: boolean = false
  options: EChartsOption = {
    color: chartColorsArray,  //< set color range for Chart series
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
      valueFormatter: (value) => Number.parseFloat(value?.toString()|| "").toFixed(2)
    },
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
    animationDuration: 100,
    series: [],
  };

  defaultSeries: LineSeriesOption = {
    type: 'line', 
    stack: 'counts',
    areaStyle: {}
  }

  constructor() {}

  get isSerieInput(): boolean {
    return (Object.keys(this.serieData.at(0) || {}).includes('data'))
  }

  ngAfterViewInit(): void {
    //dom exists so it can get the graph
    this.lineGraph = echarts.init(document.getElementById('line-graph-'+this.graphId));

    // need time for custom tooltip formatter
    // if(!!this.tooltipFormatter) {
    //   this.options.tooltip = {
    //     ...this.options.tooltip,
    //   }
    // }

    //this is not 'on finished' of the render, but 'on finished' of the animation
    this.lineGraph.on('finished', () => {
      if(!this.updateLegend) { 
        return; 
      }
      const legendsArray = (this.lineGraph as any)
        .getModel()
        .getSeries()
        .map((s: SeriesModel) => {
          return {
            seriesIndex: s.seriesIndex,
            seriesName: s.name,
            seriesColor: this.lineGraph.getVisual({
              seriesIndex: s.seriesIndex
            }, 'color'),
            seriesActive: (this.lineGraph as any).getModel().getComponent('legend').isSelected(s.name)
          };
        }
      );

      this.updateLegend = false;
      this.legendUpdateEvent.emit(legendsArray);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    //ignore changes if graph is not init
    if(!this.lineGraph) {
      return ;
    }
    //if changes are graphs changes
    if(!!changes['xAxis'] && !!changes['serieData']) {
      this.updateGraphEntirely(changes['xAxis'], changes['serieData']);
    }

    if(!changes['xAxis'] && !!changes['serieData']) {
      this.updateGraphOptionSerie(changes['serieData']);
      this.updateGraphCanvas();
    }

    //if changes are toggleLagend changes
    if(!!changes['toggleLegend'] && !!changes['toggleLegend'].currentValue) {
      this.updateLegend = !!changes['toggleLegend'].currentValue;
      this.lineGraph.dispatchAction({type: 'legendToggleSelect', name: (changes['toggleLegend'].currentValue as string)});
    }
  }

  updateGraphEntirely(xAxis: SimpleChange, serieData: SimpleChange): void {
    this.updateGraphOptionxAxis(xAxis);
    this.updateGraphOptionSerie(serieData);

    this.updateGraphCanvas();
  }

  updateGraphOptionSerie(serieData: SimpleChange) {
    if(this.isSerieInput) {
      this.options = { 
        ...this.options, 
        series: (serieData.currentValue as ChartSerie[]).map((elem): SeriesOption => {
          return {
            ...this.defaultSeries,
            name: elem.name,
            data: elem.data,
          };
        }),
      };
      this.updateLegend = true;

     } else { //if is single serie 
      this.options = { 
        ...this.options, 
        series: [{ 
          ...this.defaultSeries,
          data: (serieData.currentValue as ChartData[]),
        }]
      };

      this.lineGraph.setOption(this.options);
      this.lineGraph.renderToCanvas();
    }
  }

  updateGraphOptionxAxis(xAxis: SimpleChange) {
    this.options = {
      ...this.options,
      xAxis: { 
        data: (xAxis.currentValue as string[]),
        boundaryGap: false,
      },
    }
  }

  updateGraphCanvas() {
    this.lineGraph.setOption(this.options);
    this.lineGraph.renderToCanvas();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.lineGraph.resize();
  }
}