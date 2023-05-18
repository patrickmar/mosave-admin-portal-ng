import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import * as moment from 'moment';
import { BaseChartDirective } from 'ng2-charts';
import { forkJoin } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { StatService } from 'src/app/services/stat.service';
import { ToastService } from 'src/app/services/toast.service';
import { chartType } from 'src/app/types/chart.enum';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, AfterViewInit, OnChanges {
  thisMonthCustomer!: Array<any>;
  allRecords !: Array<any>;
  trnxRecords!: Array<any>;
  savingsRecords!: Array<any>;
  withdrawalRecords!: Array<any>;
  commissionRecords!: Array<any>;
  bestSavers !: Array<any>;
  savingsSum!: number;
  withdrawalSum!: number;
  commissionSum!: number;
  yesterdaytrnxSum!: number;
  totalBalance!: number;
  dayDiff: number = 12;
  userRecord!: Array<any>;
  labels: any = [];
  dataSets2!: any; 
  bgMap: any = {'0': 'bg-primary', '1': 'bg-info', '2': ''};
  gradients = [
    ["rgba(55,125,255, .5)", "rgba(255, 255, 255, .2)"], 
    ["rgba(0, 201, 219, .5)", "rgba(255, 255, 255, .2)"], 
    ["rgba(100, 0, 214, 0.8)", "rgba(255, 255, 255, .2)"]
  ]
  
  

  public lineChartOptions: Array<object> = 
  [ 
    this.getChartConfig(500000, '₦'), 
    this.getChartConfig(200, ''), 
    this.getChartConfig(20, ''),
    this.getChartConfig(100, '')
  ]; //ChartConfiguration['options'] or //ChartOptions[] // default data model
  public lineChartType: ChartType[] = ['line', 'line', 'line', 'line']; //'line';
  public lineChartLabels: Array<any> = [
    ["Savings", "Withdrawal", "Commissions"],
    ["Savings", "Withdrawal", "Commissions"],
    ["Volume"],
    ["Male", "Female"]
  ];
  chartTitle: string[] = ['Transaction Values', 'Transaction Volume', 'User Registration', 'Savings Volume By Gender' ]
  userVolume!: number;
  genderVolume!: number;
  totalValue!: Array<any>;
  public lineChartData: Array<any> = [];
  color: Array<string> =  ["#377dff", "#00c9db", "#7000f2"]
  
  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;
  //@ViewChild('aChart') htmlChart!: ElementRef;
  canvas!: any;
  ctx!: any;
  gradient!: any;
  gradient2!: any;
  gradient3!: any;
  canvas1!: any;
  ctx1!: any;
  gradient11!: any;
  gradient12!: any;
  gradient13!: any;
  canvas2!: any;
  ctx2!: any;
  gradient21!: any;
  canvas3!: any;
  ctx3!: any;
  gradient31!: any;
  gradient32!: any;
  tnxVolumeSum!: number;


  constructor(private dataService: DataService, 
    private statService: StatService, 
    private toastService: ToastService,
    private el: ElementRef, private changeDetectorRef: ChangeDetectorRef) { }

  
  ngAfterViewInit(): void {
    this.getAllTrxs();
    //this.getAllUsers();
  }

  ngOnInit(): void {
    //this.getAllTrxs();
     //this.getAllUsers();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
  }

  getChartConfig(stepSize: number, postfix: string){
    return {
      responsive: true,
      aspectRatio: 3.5,
      tension: 0.3,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          display: false,
          //position: 'top',
        },
        tooltip: {
          position: 'nearest',
          mode: "index",
          intersect: false,
          usePointStyle: true,
          callbacks: {
            title:(tooltipItems: any)=> {
                return tooltipItems[0].label;
            },
            footer: (tooltipItems: any) => {
              let value = 0
              // Calculate difference
              value = tooltipItems.length > 1 ? tooltipItems[0]?.parsed?.y - tooltipItems[1]?.parsed?.y : tooltipItems[0]?.parsed?.y;
              return 'Floating Value: ' + value;
            },
            label: (tooltipItems: any)=> {              
              return tooltipItems.dataset.label + ': ' + postfix + tooltipItems.formattedValue;
          },
          }
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            //padding: 10,
          },
        },
        y: {
          // title: {
          //   display: true,
          //   text: 'Values'
          // },
          beginAtZero: true,
          grid: {
            drawBorder: false,
            color: "#e7eaf3",
          },
          min: 0,
          //max: 100000,
          ticks: {
            stepSize: stepSize,// 500000,
            //padding: 20,
          },
        }
      },
    }
    ;
  }

  getAllTrxs() {
    try {
      forkJoin([
        this.dataService.getMosaveTransactions(),
        this.dataService.getMosaveSavingTransactions(),
        this.dataService.getAllcustomers()
      ]).subscribe((result: any) => {
        console.log(result[0]);
        console.log(result[2]);
        const newRecords = result[0].map((res: any) => {
          const type2 = res.transType == "S" ? res.transType + "avings" :
            res.transType == "W" ? res.transType + "ithdrawal" : res.transType + "";
          return { ...res, transType: type2 };
        })
        this.allRecords = newRecords;
        this.trnxRecords = newRecords;
        this.savingsRecords = this.allRecords.filter((item: any) => item.transType === 'Savings');
        this.withdrawalRecords = this.allRecords.filter((item: any) => item.transType === 'Withdrawal');
        this.commissionRecords = this.allRecords.filter((item: any) => item.transType === "commission");
        //calculate the total withdrawals
        this.savingsSum = this.savingsRecords.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
        //calculate the total withdrawals
        this.withdrawalSum = this.withdrawalRecords.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
        //calculate the total commissions
        this.commissionSum = this.commissionRecords.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
        this.totalBalance = this.savingsSum - this.withdrawalSum;

        const trnxValuesByMonth = this.statService.getTotalTrnxValuesByMonth(this.allRecords);
        const trnxVolumesByMonth = this.statService.getTotalTrnxsVolumesByMonth(this.allRecords);
        console.log(trnxVolumesByMonth);
        const labels: Array<string> = [];
        const savings: Array<number> = [];
        const withdrawals: Array<number> = [];
        const commissions: Array<number> = [];
        new Array(trnxValuesByMonth.length).fill(null).map((x, i) => {          
          const element = trnxValuesByMonth[i];
          labels.push(element?.month);
          savings.push(element?.savings);
          withdrawals.push(element?.withdrawal);
          commissions.push(element?.commission);
        })
        
        const labelVolume: Array<string> = [];
        const savingsVolume: Array<number> = [];
        const withdrawalsVolume: Array<number> = [];
        const commissionsVolume: Array<number> = [];
        const dataset:Array<any> = []
        const dataset2:Array<any> = []
        new Array(trnxVolumesByMonth.length).fill(null).map((x, i) => {
          const element = trnxVolumesByMonth[i];
          labelVolume.push(element?.month);
          savingsVolume.push(element?.savings);
          withdrawalsVolume.push(element?.withdrawal);
          commissionsVolume.push(element?.commission);
        });
        const savingsVolumeSum = savingsVolume.reduce((acc: any, cur: any)=>  acc + cur);
        const withdrawalVolumeSum = withdrawalsVolume.reduce((acc: any, cur: any)=>  acc + cur);
        const commissionVolumeSum = commissionsVolume.reduce((acc: any, cur: any)=>  acc + cur);
        this.tnxVolumeSum = savingsVolumeSum + withdrawalVolumeSum + commissionVolumeSum;

        //  this.getCanvasConfig();

        this.canvas = <HTMLCanvasElement> document.getElementById('lineChart0'); // $("#canvas");  
    this.ctx = this.canvas?.getContext('2d');
    console.log(this.ctx);
    //this.charts?.get(0)?.ctx
    console.log(this.charts?.get(0)?.ctx);
    this.gradient = this.ctx?.createLinearGradient(0, 0, 0, 200);
    this.gradient2 = this.ctx?.createLinearGradient(0, 0, 0, 200);
    this.gradient3 = this.ctx?.createLinearGradient(0, 0, 0, 200);

    // this.canvas1 = <HTMLCanvasElement> document.getElementById('lineChart1');
    // this.ctx1 = this.canvas1?.getContext('2d');
    // this.gradient11 = this.ctx1?.createLinearGradient(0, 0, 0, 200);
    // this.gradient12 = this.ctx1?.createLinearGradient(0, 0, 0, 200);
    // this.gradient13 = this.ctx1?.createLinearGradient(0, 0, 0, 200);

    // this.canvas2 = <HTMLCanvasElement> document.getElementById('lineChart2');
    // this.ctx2 = this.canvas2?.getContext('2d');    
    // this.gradient21 = this.ctx2?.createLinearGradient(0, 0, 0, 200);

    // this.canvas3 = <HTMLCanvasElement> document.getElementById('lineChart3');
    // this.ctx3 = this.canvas3?.getContext('2d');
    
    // this.gradient31 = this.ctx3?.createLinearGradient(0, 0, 0, 200);
    // this.gradient32 = this.ctx3?.createLinearGradient(0, 0, 0, 200); 
    

    this.gradient?.addColorStop(0, 'rgba(55,125,255, .5)');
    this.gradient?.addColorStop(1, 'rgba(255, 255, 255, .2)');

    this.gradient2?.addColorStop(0, 'rgba(0, 201, 219, .5)');
    this.gradient2?.addColorStop(1, 'rgba(255, 255, 255, .2)');

    this.gradient3?.addColorStop(0, 'rgba(100, 0, 214, 0.8)');
    this.gradient3?.addColorStop(1, 'rgba(255, 255, 255, .2)');

    this.gradient11?.addColorStop(0, 'rgba(55,125,255, .5)');
    this.gradient11?.addColorStop(1, 'rgba(255, 255, 255, .2)');

    this.gradient12?.addColorStop(0, 'rgba(0, 201, 219, .5)');
    this.gradient12?.addColorStop(1, 'rgba(255, 255, 255, .2)');

    this.gradient13?.addColorStop(0, 'rgba(100, 0, 214, 0.8)');
    this.gradient13?.addColorStop(1, 'rgba(255, 255, 255, .2)');

    this.gradient21?.addColorStop(0, 'rgba(55,125,255, .5)');
    this.gradient21?.addColorStop(1, 'rgba(255, 255, 255, .2)');

    this.gradient31?.addColorStop(0, 'rgba(55,125,255, .5)');
    this.gradient31?.addColorStop(1, 'rgba(255, 255, 255, .2)');

    this.gradient32?.addColorStop(0, 'rgba(0, 201, 219, .5)');
    this.gradient32?.addColorStop(1, 'rgba(255, 255, 255, .2)');




        const data = [savings, withdrawals, commissions];
        const data2 = [savingsVolume, withdrawalsVolume, commissionsVolume]; 
        const gradient = [this.gradient, this.gradient2, this.gradient3]; 
        const gradient2 = [this.gradient11, this.gradient12, this.gradient13];
        const datasets = this.getDataSet(this.lineChartLabels[0], data, gradient, dataset);
        console.log(datasets);
        const datasets2 = this.getDataSet(this.lineChartLabels[1], data2, gradient2, dataset2);  
        this.labels = labels;
        
        this.lineChartData[0] = {
          labels: labels, 
          datasets: datasets,
        }

        this.lineChartData[1] = {
          labels: labels,
          datasets: datasets2,
        }

        this.getAllUsers(result[2]);
        this.getGenderPerMonth(this.savingsRecords);
        //this.getCanvasConfig();

        this.totalValue = [this.totalBalance, this.tnxVolumeSum, this.userVolume, this.genderVolume];

      }), (error: any) => {
        console.log(error);
        this.toastService.showError(error[0]?.message, 'Error');
      }

    } catch (error) {
      this.toastService.showError('Please check your internet and refresh', 'Error');

    }

  
  }

  dataSetConfig(label: string, data: any, bgColor: any, color: string) {
    console.log(label);
    console.log(data);
    console.log(bgColor);
    console.log(color);
    return { data: data, label: label, backgroundColor: bgColor, borderColor: color,
      borderWidth: 2, pointRadius: 0, hoverBorderColor: color, pointBackgroundColor: color, 
      pointBorderColor: "#fff", pointHoverRadius: 0, fill: true,
      fillColor: bgColor,
    }
  }

  getDataSet(chartLabel:Array<any>, data: Array<any>, gradient:Array<any>, dataset:Array<any> ){
      for (let i = 0; i < chartLabel.length; i++) {
        const element = chartLabel[i];
        const val = this.dataSetConfig(element, data[i], gradient[i], this.color[i]);
        dataset.push(val);             
      }
      return dataset;
  }

  getAllUsers(result: Array<any>){
    // try {
    //   this.dataService.getAllcustomers().subscribe((result: any) => {
        console.log(result);
        this.userRecord = result;
        const userRecord = this.statService.getTotalUsersByMonth(result);
        //this.getCanvasConfig();
        const lab: Array<string> = [];
        const users: Array<number> = [];   
        const dataset:Array<any> = []     
        const grad3 = [this.gradient21]
        new Array(userRecord.length).fill(null).map((x, i) => {          
          const element = userRecord[i];
          lab.push(element?.month);
          users.push(element?.users);
        })
        console.log(users);
        const data = [users];
        const dataSum = data[0].reduce((acc: any, cur: any)=>  acc + cur);
        console.log(dataSum);
        this.userVolume = dataSum;
        const datasets = this.getDataSet(this.lineChartLabels[2], data, grad3, dataset);
        console.log(datasets)
        
        this.lineChartData[2] = {
          labels: lab,
          datasets: datasets,
          }
      // }, (error: any) =>{
      //   console.log(error);
      //   this.toastService.showError(error?.message, 'Error');
      // })
      
    // } catch (error) {
      
    // }
  }

  getGenderPerMonth(array: Array<any>) {
    const value = this.statService.getTotalSavingsVolumeByGenderPerMonth(array);
    const labels: Array<string> = [];
    const male: Array<number> = [];
    const female: Array<number> = [];
    const dataset:Array<any> = []
    new Array(value.length).fill(null).map((x, i) => {
      const element = value[i];
      labels.push(element?.month);
      male.push(element?.male);
      female.push(element?.female);
    })
    console.log(labels)
    console.log(male)
    console.log(female)
    const data = [male, female];
    const maleSum = male.reduce((acc: any, cur: any)=>  acc + cur);
    console.log(maleSum);
    const femaleSum = female.reduce((acc: any, cur: any)=>  acc + cur);
    console.log(femaleSum);
    this.genderVolume = maleSum + femaleSum; 
    const gradient = [this.gradient31, this.gradient32]
    const datasets3 = this.getDataSet(this.lineChartLabels[3], data, gradient, dataset);
    this.lineChartData[3] = {
      labels: labels,
      datasets: datasets3,
    }
  }

  getCanvasConfig(){
    // this.canvas = this.el.nativeElement.querySelector('canvas');
    // this.ctx = this.canvas.getContext('2d');

    //let lineCtx = this.charts.nativeElement.getContext('2d'); 


    // const charts = this.charts.map((chartElementRef, index) => {
    //   const config = Object.assign({}, baseConfig, { data: this.charts[index] });

    //   return new Chart(chartElementRef.nativeElement, config);
    // });
    
    // for (const chart of this.charts) {
    //   const ctx2: CanvasRenderingContext2D = chart //getContext('2d');
    // }

    // const ctx: CanvasRenderingContext2D = this.charts.map((item: any):void => {
    //   item.nativeElement.getContext('2d')

    // })  //nativeElement.getContext('2d');
    //console.log(ctx);

    this.canvas = <HTMLCanvasElement> document.getElementById('lineChart0'); // $("#canvas"); 
    this.ctx = this.canvas?.getContext('2d');
    console.log(this.ctx);
    this.charts?.get(0)?.ctx
    console.log(this.charts?.get(0)?.ctx);
    this.gradient = this.ctx?.createLinearGradient(0, 0, 0, 200);
    this.gradient2 = this.ctx?.createLinearGradient(0, 0, 0, 200);
    this.gradient3 = this.ctx?.createLinearGradient(0, 0, 0, 200);

    this.canvas1 = <HTMLCanvasElement> document.getElementById('lineChart1');
    this.ctx1 = this.canvas1?.getContext('2d');
    this.gradient11 = this.ctx1?.createLinearGradient(0, 0, 0, 200);
    this.gradient12 = this.ctx1?.createLinearGradient(0, 0, 0, 200);
    this.gradient13 = this.ctx1?.createLinearGradient(0, 0, 0, 200);

    this.canvas2 = <HTMLCanvasElement> document.getElementById('lineChart2');
    this.ctx2 = this.canvas2?.getContext('2d');    
    this.gradient21 = this.ctx2?.createLinearGradient(0, 0, 0, 200);

    this.canvas3 = <HTMLCanvasElement> document.getElementById('lineChart3');
    this.ctx3 = this.canvas3?.getContext('2d');
    
    this.gradient31 = this.ctx3?.createLinearGradient(0, 0, 0, 200);
    this.gradient32 = this.ctx3?.createLinearGradient(0, 0, 0, 200); 
    

    this.gradient?.addColorStop(0, 'rgba(55,125,255, .5)');
    this.gradient?.addColorStop(1, 'rgba(255, 255, 255, .2)');

    this.gradient2?.addColorStop(0, 'rgba(0, 201, 219, .5)');
    this.gradient2?.addColorStop(1, 'rgba(255, 255, 255, .2)');

    this.gradient3?.addColorStop(0, 'rgba(100, 0, 214, 0.8)');
    this.gradient3?.addColorStop(1, 'rgba(255, 255, 255, .2)');

    this.gradient11?.addColorStop(0, 'rgba(55,125,255, .5)');
    this.gradient11?.addColorStop(1, 'rgba(255, 255, 255, .2)');

    this.gradient12?.addColorStop(0, 'rgba(0, 201, 219, .5)');
    this.gradient12?.addColorStop(1, 'rgba(255, 255, 255, .2)');

    this.gradient13?.addColorStop(0, 'rgba(100, 0, 214, 0.8)');
    this.gradient13?.addColorStop(1, 'rgba(255, 255, 255, .2)');

    this.gradient21?.addColorStop(0, 'rgba(55,125,255, .5)');
    this.gradient21?.addColorStop(1, 'rgba(255, 255, 255, .2)');

    this.gradient31?.addColorStop(0, 'rgba(55,125,255, .5)');
    this.gradient31?.addColorStop(1, 'rgba(255, 255, 255, .2)');

    this.gradient32?.addColorStop(0, 'rgba(0, 201, 219, .5)');
    this.gradient32?.addColorStop(1, 'rgba(255, 255, 255, .2)');
  }

  getBase64(chartId: number) {
    return this.charts.get(chartId)?.toBase64Image();
  }

  downloadGraph(chartId: number){
    console.log(chartId)
    console.log(this.charts);
    const fileName = this.charts.get(chartId)?.type +'chart'+ new Date().getTime()+Math.floor(Math.random() * 10000) + '.png';
    const src = this.getBase64(chartId)+'';
    const link = document.createElement("a");
    link.href = src
    link.download = fileName
    link.click()
    link.remove()
  }

  switchGraph(id: number, tab: string) {
    //console.log(this.charts);
    const gradient1 = [
      [this.gradient, this.gradient2, this.gradient3],
      [this.gradient11, this.gradient12, this.gradient13]
    ];
      const element = this.lineChartData[id].datasets;
      if(tab === 'bar'){
        if (this.lineChartType[id] === 'line'  ) {
          this.lineChartType[id] = 'bar';
          for (let i = 0; i < element.length; i++) {
            element[i].backgroundColor = this.gradients[i][0];
            element[i].hoverBackgroundColor = this.gradients[i][0];        
          }       
        }
      } else if(tab === 'line') {
        if (this.lineChartType[id] === 'bar') {
          this.lineChartType[id] = 'line'
          for (let i = 0; i < element.length; i++) {
            element[i].backgroundColor = gradient1[0][i];  
            element[i].hoverBackgroundColor = gradient1[0][i];        
          } 
        }
        this.charts.get(id)?.update();
      }
        
  }

}
