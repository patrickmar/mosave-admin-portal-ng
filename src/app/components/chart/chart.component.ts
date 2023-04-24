import { Component, Input, OnInit, Output, EventEmitter, ViewChildren, QueryList, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';




@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, AfterViewInit {  

  // @Input() type!: ChartType;
  // @Input() dataSets?: ChartDataSets[] | any;
  // @Input() labels!: string[];
  // @Input() options: ChartOptions = {
  //   responsive: true,
  // };
  // chart!: Chart[]

  // charts: Chart[] = [];



  @Input() index!: number;
  @Input() type?: any;
  @Input() data?: any;
  @Input() options?: any;
  @Input() totalValue?: any; 
  @Input() percentage?: number; 
  @Input() currency?: string;
  @Input() title?: string;
  @Input() label?: Array<string>;
  @Output() download: EventEmitter<any> = new EventEmitter();
  @Output() switch: EventEmitter<any> = new EventEmitter();
  bgMap: any = {'0': 'bg-primary', '1': 'bg-info', '2': ''};
  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;
  @Input() canvas: any;
//  @ViewChild('kpichart') kpichart!: ElementRef;
  @ViewChildren('chart', { read: ElementRef }) chartElementRefs!: QueryList<ElementRef>;

  chartData: Chart[] = []

  // baseConfig: Chart.ChartConfiguration = {
  //   type: 'line', 
  //   options: {
  //     responsive: true,
  //     maintainAspectRatio: false,
  //     legend: { display: false },
  //     scales: {
  //       xAxes: [{ display: false }],
  //       yAxes: [{ display: false }],
  //     }
  //   }
  // };
  

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    console.log(this.data);
  }

  downloadGraph(id:number){
    this.download?.emit({id});
  }

  switchgraph(id:number){
    this.switch?.emit({id});
  }

  // ngAfterViewInit() {
  //   this.charts = this.chartElementRefs.map((chartElementRef, index) => {
  //     const config = Object.assign({}, this.baseConfig, { data: this.chartData[index] });
      
  //     return new Chart(chartElementRef.nativeElement, config);
  //   });
  // }

  ngAfterViewInit() {
    // this.dataSets?.forEach((dataset) => {

    //   dataset?.datalabels?.backgroundColor = [];
    //   dataset.datalabels.borderColor = [' '];
    //   dataset.borderWidth = 3;
    // });

    // this.dataSets = []

    
    //console.log(this.chart);
    // for (let index = 0; index < 2; index++) {
    //   //const element = this.chart[index];
    //   console.log()
    //   const canvas = this.el.nativeElement.querySelector('chart');
    // const ctx = canvas.getContext('2d');
    //   const chart = new Chart(ctx, {
    //     type: this.type,
    //     data: {
    //       labels: this.labels,
    //       datasets: this.dataSets,
    //     },
    //     options: this.options,
    //   });
    //   //var chartInstance = new Chart(ctx, config);
    //   this.chart.push(chart);      
    // }

    // console.log(this.chart);

  }

  // getBase64(chartId: number) {
  //   console.log(this.chart?.[chartId]?.toBase64Image());
  //   return this.chart?.[chartId]?.toBase64Image();
  // }

  downloadGraphs(chartId: number){
    console.log(chartId)
    //console.log(this.chart);
    // const fileName = this.chart[chartId]?.type +'chart'+ new Date().getTime()+''+Math.floor(Math.random() * 10000) + '.png';
    // const src = this.getBase64(chartId)+'';
    // const link = document.createElement("a");
    // link.href = src
    // link.download = fileName
    // link.click()
    // link.remove()
  }

}
