import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
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
  styleUrls: ['./overview.component.css'],
})
export class OverviewComponent implements OnInit, AfterViewInit, OnChanges {
  thisMonthCustomer!: Array<any>;
  allRecords!: Array<any>;
  trnxRecords!: Array<any>;
  savingsRecords!: Array<any>;
  withdrawalRecords!: Array<any>;
  commissionRecords!: Array<any>;
  bestSavers!: Array<any>;
  savingsSum!: number;
  withdrawalSum!: number;
  commissionSum!: number;
  yesterdaytrnxSum!: number;
  totalBalance!: number;
  dayDiff: number = 12;
  userRecord!: Array<any>;
  labels: any = [];
  dataSets2!: any;
  bgMap: any = { '0': 'bg-primary', '1': 'bg-success', '2': '' };
  gradients = [
    ['rgba(0, 201, 167, .5)', 'rgba(255, 255, 255, .2)'],
    ['rgba(237, 76, 120, .5)', 'rgba(255, 255, 255, .2)'],
    ['rgba(245, 202, 153, 0.8)', 'rgba(255, 255, 255, .2)'],
  ];
  public loading = false;
  public showComponent = false;
  selectedYear = moment().format('YYYY');
  yearRanges!: Array<any>;
  ranges = [
    moment().subtract(11, 'months').startOf('month').format('MMM YYYY'),
    moment().endOf('day').format('MMM YYYY'),
  ];

  public lineChartOptions: Array<object> = [
    this.getChartConfig(500000, '₦'),
    this.getChartConfig(200, ''),
    this.getChartConfig(20, ''),
    this.getChartConfig(100, ''),
  ]; //ChartConfiguration['options'] or //ChartOptions[] // default data model
  public lineChartType: ChartType[] = ['line', 'line', 'line', 'line']; //'line';
  //public lineChartType: ChartType = 'line';
  public lineChartLegend = [true, true, true, true];
  public lineChartPlugins: any[] = [[], [], [], []];
  public lineChartLabels: Array<any> = [
    ['Savings', 'Withdrawal', 'Commissions'],
    ['Savings', 'Withdrawal', 'Commissions'],
    ['Volume'],
    ['Male', 'Female', 'Unspecified'],
  ];
  chartTitle: string[] = [
    'Transaction Values',
    'Transaction Volume',
    'User Registration',
    'Savings Volume By Gender',
  ];
  userVolume!: number;
  genderVolume!: number;
  totalValue!: Array<any>;
  public lineChartData: Array<any> = [];
  color: Array<string> = ['#377dff', '#00c9db', '#7000f2'];
  //color: Array<string> = ['#00c9a7', '#ed4c78', '#FFC107'];
  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;
  canvas!: any;
  ctx!: any;
  canvas1!: any;
  ctx1!: any;
  canvas2!: any;
  ctx2!: any;
  canvas3!: any;
  ctx3!: any;
  tnxVolumeSum!: number;
  users!: Array<any>;
  results!: Array<any>;

  // private gradientA: CanvasGradient = this.createLinearGradient(
  //   'rgba(255, 99, 132, 0.2)',
  //   'rgba(255, 99, 132, 0.0)'
  // );
  // private gradientB: CanvasGradient = this.createLinearGradient(
  //   'rgba(75, 192, 192, 0.2)',
  //   'rgba(75, 192, 192, 0.0)'
  // );

  private gradient = this.createLinearGradient(
    'rgba(55,125,255, .5)',
    'rgba(255, 255, 255, .2)'
  );

  private gradient2 = this.createLinearGradient(
    'rgba(0, 201, 219, .5)',
    'rgba(255, 255, 255, .2)'
  );

  private gradient3 = this.createLinearGradient(
    'rgba(100, 0, 214, 0.8)',
    'rgba(255, 255, 255, .2)'
  );

  private gradient11 = this.createLinearGradient(
    'rgba(55,125,255, .5)',
    'rgba(255, 255, 255, .2)'
  );

  private gradient12 = this.createLinearGradient(
    'rgba(0, 201, 219, .5)',
    'rgba(255, 255, 255, .2)'
  );

  private gradient13 = this.createLinearGradient(
    'rgba(100, 0, 214, 0.8)',
    'rgba(255, 255, 255, .2)'
  );

  private gradient21 = this.createLinearGradient(
    'rgba(55,125,255, .5)',
    'rgba(255, 255, 255, .2)'
  );

  private gradient31 = this.createLinearGradient(
    'rgba(55,125,255, .5)',
    'rgba(255, 255, 255, .2)'
  );

  private gradient32 = this.createLinearGradient(
    'rgba(0, 201, 219, .5)',
    'rgba(255, 255, 255, .2)'
  );

  private gradient33 = this.createLinearGradient(
    'rgba(100, 0, 214, 0.8)',
    'rgba(255, 255, 255, .2)'
  );

  constructor(
    private dataService: DataService,
    private statService: StatService,
    private toastService: ToastService,
    private el: ElementRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.getAllTrxs();
    //this.getAllUsers();
  }

  ngOnInit(): void {
    //this.getAllTrxs();
    //this.getAllUsers();
    this.yearRanges = this.statService.getYearRanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
  }

  getChartConfig(stepSize: number, postfix: string) {
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
          mode: 'index',
          intersect: false,
          usePointStyle: true,
          callbacks: {
            title: (tooltipItems: any) => {
              return tooltipItems[0].label;
            },
            footer: (tooltipItems: any) => {
              let value = 0;
              // Calculate difference
              value =
                tooltipItems.length > 1
                  ? tooltipItems[0]?.parsed?.y - tooltipItems[1]?.parsed?.y
                  : tooltipItems[0]?.parsed?.y;
              return 'Floating Value: ' + value;
            },
            label: (tooltipItems: any) => {
              return (
                tooltipItems.dataset.label +
                ': ' +
                postfix +
                tooltipItems.formattedValue
              );
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false,
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
            color: '#e7eaf3',
          },
          min: 0,
          //max: 100000,
          ticks: {
            stepSize: stepSize, // 500000,
            //padding: 20,
          },
        },
      },
    };
  }

  filterDataByDate(item: any) {
    const { timeline, date } = item;
    const format = 'MMM YYYY';
    $(
      '#js-daterangepicker-predefined .js-daterangepicker-predefined-preview'
    ).html(date[0].format(format) + ' - ' + date[1].format(format));
    //this.selectedYear = item;
    this.getTrnxValues(this.results, date[0], date[1]);
    this.getGenderPerMonth(this.savingsRecords, date[0], date[1]);
    this.getAllUsers(this.users, date[0], date[1]);
  }

  createLinearGradient(color1: string, color2: string): CanvasGradient {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) throw new Error('Unable to create canvas context');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  }

  getAllTrxs() {
    try {
      this.loading = true;
      forkJoin([
        this.dataService.getMosaveTransactions(),
        this.dataService.getMosaveSavingTransactions(),
        this.dataService.getAllcustomers(),
      ]).subscribe((result: any) => {
        // console.log(result[0]);
        // console.log(result[2]);
        this.loading = false;
        this.showComponent = true;
        this.users = result[2];
        this.results = result;

        this.getTrnxValues(this.results);
        this.getAllUsers(this.users);
        this.getGenderPerMonth(this.savingsRecords);
        this.totalValue = [
          this.totalBalance,
          this.tnxVolumeSum,
          this.userVolume,
          this.genderVolume,
        ];
      }),
        (error: any) => {
          console.log(error);
          this.loading = false;
          this.toastService.showError('Error fetching data', 'Error');
        };
    } catch (error) {
      this.loading = false;
      this.toastService.showError(
        'Please check your internet and refresh',
        'Error'
      );
    }
  }

  getTrnxValues(result: Array<any>, start?: Date, end?: Date) {
    const mapTransactionType = (transType: string): string => {
      if (transType === 'S') return 'Savings';
      if (transType === 'W') return 'Withdrawal';
      return transType;
    };

    const calculateTotal = (records: any[], transType: string): number => {
      return records
        .filter((item) => item.transType === transType)
        .reduce((sum, current) => sum + Number(current.transAmount), 0);
    };

    const transformTransactionType = (result: any[]): any[] => {
      return result[0].map((res: any) => {
        const type2 = mapTransactionType(res.transType);
        return { ...res, transType: type2 };
      });
    };

    this.allRecords = transformTransactionType(result);
    this.trnxRecords = transformTransactionType(result);

    this.savingsRecords = this.allRecords.filter(
      (item) => item.transType === 'Savings'
    );
    this.withdrawalRecords = this.allRecords.filter(
      (item) => item.transType === 'Withdrawal'
    );
    this.commissionRecords = this.allRecords.filter(
      (item) => item.transType === 'commission'
    );

    this.savingsSum = calculateTotal(this.savingsRecords, 'Savings');
    this.withdrawalSum = calculateTotal(this.withdrawalRecords, 'Withdrawal');
    this.commissionSum = calculateTotal(this.commissionRecords, 'commission');
    this.totalBalance = this.savingsSum - this.withdrawalSum;

    const trnxValuesByMonth = this.statService.getTotalTrnxValuesByMonth(
      this.allRecords,
      start,
      end
    );
    const trnxVolumesByMonth = this.statService.getTotalTrnxsVolumesByMonth(
      this.allRecords,
      start,
      end
    );

    const processTrnxValuesByMonth = (
      trnxValuesByMonth: any[],
      value: string
    ) => {
      return trnxValuesByMonth.map((element: any) => element?.[value]);
    };

    const processTrnxVolumesByMonth = (
      trnxVolumesByMonth: any[],
      value: string
    ) => {
      return trnxVolumesByMonth.map((element: any) => element?.[value]);
    };

    const labels = processTrnxValuesByMonth(trnxValuesByMonth, 'month');
    const savings = processTrnxValuesByMonth(trnxValuesByMonth, 'savings');
    const withdrawals = processTrnxValuesByMonth(
      trnxValuesByMonth,
      'withdrawal'
    );
    const commissions = processTrnxValuesByMonth(
      trnxValuesByMonth,
      'commission'
    );

    const labelVolume = processTrnxVolumesByMonth(trnxVolumesByMonth, 'month');
    const savingsVolume = processTrnxVolumesByMonth(
      trnxVolumesByMonth,
      'savings'
    );
    const withdrawalsVolume = processTrnxVolumesByMonth(
      trnxVolumesByMonth,
      'withdrawal'
    );
    const commissionsVolume = processTrnxVolumesByMonth(
      trnxVolumesByMonth,
      'commission'
    );

    const dataset: Array<any> = [];
    const dataset2: Array<any> = [];

    const savingsVolumeSum = this.calculateVolumeSum(savingsVolume);
    const withdrawalVolumeSum = this.calculateVolumeSum(withdrawalsVolume);
    const commissionVolumeSum = this.calculateVolumeSum(commissionsVolume);
    this.tnxVolumeSum =
      savingsVolumeSum + withdrawalVolumeSum + commissionVolumeSum;

    const data = [savings, withdrawals, commissions];
    const data2 = [savingsVolume, withdrawalsVolume, commissionsVolume];
    const gradient = [this.gradient, this.gradient2, this.gradient3];
    const gradient2 = [this.gradient11, this.gradient12, this.gradient13];
    const datasets = this.getDataSet(
      this.lineChartLabels[0],
      data,
      gradient,
      dataset
    );
    const datasets2 = this.getDataSet(
      this.lineChartLabels[1],
      data2,
      gradient2,
      dataset2
    );
    this.labels = labels;

    this.lineChartData[0] = {
      labels: labels,
      datasets: datasets,
    };

    this.lineChartData[1] = {
      labels: labelVolume,
      datasets: datasets2,
    };
  }

  calculateVolumeSum(volumes: number[]): number {
    return volumes.reduce((acc: any, cur: any) => acc + cur, 0);
  }

  dataSetConfig(label: string, data: any, bgColor: any, color: string) {
    return {
      data: data,
      label: label,
      backgroundColor: bgColor,
      borderColor: color,
      borderWidth: 2,
      pointRadius: 0,
      hoverBorderColor: color,
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      pointHoverRadius: 0,
      fill: true,
      fillColor: bgColor,
    };
  }

  getDataSet(
    chartLabel: Array<any>,
    data: Array<any>,
    gradient: Array<any>,
    dataset: Array<any>
  ) {
    for (let i = 0; i < chartLabel.length; i++) {
      const val = this.dataSetConfig(
        chartLabel[i],
        data[i],
        gradient[i],
        this.color[i]
      );
      dataset.push(val);
    }
    return dataset;
  }

  getAllUsers(result: Array<any>, start?: Date, end?: Date) {
    this.userRecord = result;
    // try {
    //   this.dataService.getAllcustomers().subscribe((result: any) => {
    const userRecord = this.statService.getTotalUsersByMonth(
      result,
      start,
      end
    );
    const lab = userRecord.map((element: any) => element?.month);
    const users = userRecord.map((element: any) => element?.users);
    const data = [users];
    const dataSum = data[0].reduce((acc: any, cur: any) => acc + (cur || 0), 0);
    this.userVolume = dataSum;
    const grad3 = [this.gradient21];
    const datasets = this.getDataSet(this.lineChartLabels[2], data, grad3, []);
    this.lineChartData[2] = {
      labels: lab,
      datasets: datasets,
    };
    // }, (error: any) =>{
    //   console.log(error);
    //   this.toastService.showError(error?.message, 'Error');
    // })

    // } catch (error) {

    // }
  }

  getGenderPerMonth(array: Array<any>, start?: Date, end?: Date) {
    const value = this.statService.getTotalSavingsVolumeByGenderPerMonth(
      array,
      start,
      end
    );
    const labels = value.map((element: any) => element?.month);
    const male = value.map((element: any) => element?.male);
    const female = value.map((element: any) => element?.female);
    const unspecified = value.map((element: any) => element?.unspecified);
    const dataset: Array<any> = [];
    const data = [male, female, unspecified];
    const calculateSum = (array: Array<number>): number =>
      array.reduce((acc, cur) => acc + (cur || 0), 0);
    const maleSum = calculateSum(male);
    const femaleSum = calculateSum(female);
    const unspecifiedSum = calculateSum(unspecified);
    this.genderVolume = maleSum + femaleSum + unspecifiedSum;
    const gradient = [this.gradient31, this.gradient32, this.gradient33];
    const datasets3 = this.getDataSet(
      this.lineChartLabels[3],
      data,
      gradient,
      dataset
    );
    this.lineChartData[3] = {
      labels: labels,
      datasets: datasets3,
    };
  }

  getBase64(chartId: number) {
    return this.charts.get(chartId)?.toBase64Image();
  }

  downloadGraph(chartId: number) {
    const fileName =
      this.charts.get(chartId)?.type +
      'chart' +
      new Date().getTime() +
      Math.floor(Math.random() * 10000) +
      '.png';
    const src = this.getBase64(chartId) + '';
    const link = document.createElement('a');
    link.href = src;
    link.download = fileName;
    link.click();
    link.remove();
  }

  switchGraph(id: number, tab: string) {
    const gradient1 = [
      [this.gradient, this.gradient2, this.gradient3],
      [this.gradient11, this.gradient12, this.gradient13],
    ];
    const element = this.lineChartData[id].datasets;
    if (tab === 'bar') {
      if (this.lineChartType[id] === 'line') {
        this.lineChartType[id] = 'bar';
        for (let i = 0; i < element.length; i++) {
          element[i].backgroundColor = gradient1[0][i];
          element[i].hoverBackgroundColor = gradient1[0][i];
        }
      }
    } else if (tab === 'line') {
      if (this.lineChartType[id] === 'bar') {
        this.lineChartType[id] = 'line';
        for (let i = 0; i < element.length; i++) {
          element[i].backgroundColor = gradient1[0][i];
          element[i].hoverBackgroundColor = gradient1[0][i];
        }
      }
      this.charts.get(id)?.update();
    }
  }
}
