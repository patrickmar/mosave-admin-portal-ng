import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { AfterViewInit, Component, NgZone, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Chart, ChartConfiguration, ChartOptions, ChartType, DoughnutControllerChartOptions, } from 'chart.js';
import { forkJoin, Subject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { StatService } from 'src/app/services/stat.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
import { DateAgoPipe } from '../../pipes/date-ago.pipe';
import { BaseChartDirective } from 'ng2-charts';
import { NgbCalendar, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

declare var $: any;
declare var HSCore: any;
declare var HSSideNav: any;
declare var HSBsDropdown: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  dataTable: any;
  user: any;
  firstname!: string;
  customer!: Array<any>;
  thisMonthCustomer!: Array<any>;
  customerExist: boolean = false;
  date: any;
  imagePath: string = environment.app.baseUrl + environment.app.imagePath;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();
  allRecords !: Array<any>;
  trnxRecords!: Array<any>;
  savingsRecords!: Array<any>;
  withdrawalRecords!: Array<any>;
  commissionRecords!: Array<any>;
  savingsTrnxRecords!: Array<any>;
  withTrnxRecords!: Array<any>;
  commTrnxRecords!: Array<any>;
  bestSavers!: Array<any>;
  savingsSum!: number;
  withdrawalSum!: number;
  commissionSum!: number;
  yesterdaytrnxSum!: number;
  totalBalance!: number;
  trnxMap: any = { 'Savings': 'Deposit', 'Withdrawal': 'Withdrawal', 'commission': 'Commission' };
  dayDiff: number = 10;
  switch!: boolean;
  emptyTable = environment.emptyTable;
  maxCount = 5; 
  public loading = false;
  public showComponent = false;
  fromDate: NgbDate;
  toDate: NgbDate | null = null;
  modalContent!: object | any;
  hoveredDate: NgbDate | null = null;
  plans = this.statService.plans;
  duration = 5000;
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: any = DataTableDirective;

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    aspectRatio: 1.4,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    }
  };

  public pieChartLabels = ['Withdrawal', 'Savings', 'Commissions'];
  public pieChartData!: any;
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  //@ViewChild(BaseChartDirective) charts?: BaseChartDirective | undefined;
  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;


  public doughnutHalfChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    aspectRatio: 1,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      // tooltips: {
      //    postfix: "%"
      // },
    }
  };
  public doughnutHalfChartType: ChartType = 'doughnut';
  public doughnutHalfChartLabels = ["Savings", "Withdrawal"];
  public doughnutHalfChartData!: any;

  public barChartOptions: any = this.getChartConfig1(50000, '₦');
  public barChartType: ChartType = 'bar';
  public barChartLabels = ["Savings", "Withdrawal"];
  public barChartData!: any;

  thirdPartyApps = [
    { name: 'Paystack', url: environment.thirdParty.paystack, service: 'Payment Gateway', src: 'paystack-logo.svg' },
    { name: 'MailChimp', url: environment.thirdParty.mailchimp, service: 'Email Service', src: 'mailchimp-icon.svg' },
    { name: 'SendGrid', url: environment.thirdParty.sendgrid, service: 'Email Service', src: 'SendGrid.svg' }
  ]
  savingsGraphSum!: number;
  withdrawalGraphSum!: number;
  last12Months!: string[];
  avgSavings!: number;
  avgWithdrawals!: number;
  dateRanges!: Array<any>;
  bestAccountBalances!: any[];
  saversTab: boolean = true;

  constructor(private authservice: AuthService, private dataService: DataService, private statService: StatService,
    private toastService: ToastService, private ngZone: NgZone, private decimalPipe: DecimalPipe, public calendar: NgbCalendar,
    private modalService: NgbModal) {
    //Chart.register(Annotation)
    //this.fromDate = calendar.getToday();
    //this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
    this.fromDate = calendar.getPrev(calendar.getToday(), 'd', 7);
    this.toDate = calendar.getToday();
  }

  getChartConfig1(stepSize: number, postfix: string) {
    return {
      responsive: true,
      aspectRatio: 1.6,
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
          position: 'nearest', //'average' or 'bottom' ;
          mode: "index",
          intersect: false,
          callbacks: {
            title: (tooltipItems: any) => {
              return tooltipItems[0].label //+ ' '+  moment().format('YYYY.');
            },
            footer: (tooltipItems: any) => {
              let sum = 0;
              let deduct = 0
              // Calculate difference
              deduct = tooltipItems[0].parsed.y - tooltipItems[1].parsed.y;
              //calculate sum
              // tooltipItems.forEach((tooltipItem: any, i:number) => {
              //   console.log(tooltipItem);
              //   //x+=y // x= x+y
              //   //sum = sum + tooltipItem.parsed.y ;
              //   deduct = deduct - (tooltipItem.parsed.y);
              // });
              return 'Diff: ' + deduct;
            },
            label: (tooltipItems: any) => {
              return tooltipItems.dataset.label + ': ' + postfix + tooltipItems.formattedValue;
            },
          }
          //postfix: "%"
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Days'
          },
          grid: {
            display: false,
            drawBorder: false
          },
        },
        y: {
          title: {
            display: true,
            text: 'Transaction Values'
          },
          grid: {
            drawBorder: false,
            color: "#e7eaf3",
          },
          min: 0,
          //max: 100000,
          ticks: {
            //stepSize: stepSize,
            //padding: 10,
          },
        }
      },

    }
  }

  ngOnInit(): void {
    this.getLast12Months();
    this.getUserDetails();
    this.getAllCustomers();
    this.getAllTrxs();
    this.dateRanges = this.statService.getDateRanges();
    //$('#datatable').DataTable();
    //this.jsOnLoad();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 15,
      processing: true,
      language: {
        zeroRecords: `<div class="text-center p-4">
            <img class="mb-3" src="${this.emptyTable}" alt="Image Description" style="width: 10rem;">
          <p class="mb-0">No data to show</p>
          </div>`,
        paginate: {
          next: 'Next',
          previous: 'Prev',
          first: '<i class="bi bi-skip-backward"></i>',
          last: '<i class="bi bi-skip-forward"></i>'
        },
      },
      lengthMenu: [10, 15, 20],
      select: true,
      dom: 'Brtip',
      buttons: [
        {
          extend: 'copy',
          className: 'd-none'
        },
        {
          extend: 'excel',
          className: 'd-none'
        },
        {
          extend: 'csv',
          className: 'd-none',
        },
        {
          extend: 'print',
          className: 'd-none'
        },
        {
          extend: 'pdf',
          className: 'd-none'
        },
      ],
      info: true,
      lengthChange: true,
    };
    this.download();

  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  ngAfterViewInit() {
    this.jsInit();
  }

  onChangeDate(startDate: any, endDate: any, timeline?: string) {
    if (this.savingsTrnxRecords != null || this.savingsTrnxRecords != undefined) {
      this.ngZone.run(() => {
        this.savingsRecords = timeline === 'All' ? this.savingsTrnxRecords : this.filterDate(startDate, endDate, this.savingsTrnxRecords);
        this.withdrawalRecords = timeline === 'All' ? this.withTrnxRecords : this.filterDate(startDate, endDate, this.withTrnxRecords);
        this.commissionRecords = timeline === 'All' ? this.commTrnxRecords : this.filterDate(startDate, endDate, this.commTrnxRecords);
        this.updateGraph(this.withdrawalRecords, this.savingsRecords, this.commissionRecords);
      });
    }
  }

  filterDate(startDate: any, endDate: any, record: Array<any>) {
    return record.filter((m: any) => new Date(m.transDate) >= new Date(startDate) && new Date(m.transDate) <= new Date(endDate));
  }

  public updateGraph(withdrawalRecords: any, savingsRecords: any, commissionRecords: any): void {
    for (let i = 0; i < this.pieChartData.datasets.length; i++) {
      this.pieChartData.datasets[i].data[0] = withdrawalRecords?.length;
      this.pieChartData.datasets[i].data[1] = savingsRecords?.length;
      this.pieChartData.datasets[i].data[2] = commissionRecords?.length;
    }
    // console.log(this.charts);
    this.charts.get(0)?.update();
    // if we want to update all the charts together
    //   this.charts?.forEach((child, i) => {
    //     if(i == 0){
    //       child?.update();
    //     }      
    // });
  }
  //ranges = [moment().format('MMM D'), moment().format('MMM D, YYYY')]
  //ranges2 = [moment().format('MMM YYYY'), moment().format('MMM YYYY')]

  ranges = [moment(this.statService.lanchDate).startOf('day').format('MMM D, YYYY'), moment().endOf('day').format('MMM D, YYYY')]
  ranges2 = [moment(this.statService.lanchDate).startOf('day').format('MMM YYYY'), moment().endOf('day').format('MMM YYYY')]

  getLast12Months() {
    this.last12Months = new Array(12).fill(null).map((x, i) => moment().subtract(i, 'months').format('MMMM YYYY')); //this.statService.getMonthDate();
  }

  // var start = moment();
  // var end = moment();

  filterDataByDate(start: any, end: any, timeline?: string, content?: any) {
    if (timeline === 'Custom Range') {
      //this.modalContent = ev;
      this.modalService.open(content);
    } else {
      const format = timeline === 'All' ? 'MMM D, YYYY' : 'MMM D';
      $('#js-daterangepicker-predefined .js-daterangepicker-predefined-preview').html(start.format(format) + ' - ' + end.format('MMM D, YYYY'));
      const startDate = start.format('YYYY-MM-DD');
      const endDate = end.format('YYYY-MM-DD');
      this.onChangeDate(startDate, endDate, timeline);
    }
  }

  filterDataByMonth(date: string, timeline?: string) {
    const start = moment(date).startOf('month')
    const end = moment(date).endOf('month')
    const format = timeline === 'All' ? 'MMM D, YYYY' : 'MMM D';
    $('#js-daterangepicker .js-daterangepicker-preview').html(start.format('MMM D, YYYY') + ' - ' + end.format('MMM D, YYYY'));
    const startDate = start.format('YYYY-MM-DD');
    const endDate = end.format('YYYY-MM-DD');
    const value = this.statService.getAverageByMonth(this.allRecords, startDate);
    if (Array.isArray(value)) {
      this.avgSavings = value[0].totalSavings > 0 ? value[0].totalSavings / value[0].savingsVolume : 0;
      this.avgWithdrawals = value[0].totalWithdrawal > 0 ? value[0].totalWithdrawal / value[0].WithdrawalVolume : 0;
    }
  }


  getUserDetails() {
    this.authservice.userData$.subscribe((response: any) => {
      this.user = response;
      var titleCasePipe = new TitleCasePipe();
      this.firstname = titleCasePipe.transform(this.user?.firstname);
    });
  }

  getAllCustomers() {
    try {
      this.dataService.getAllcustomers().subscribe((data: any) => {
        this.customer = data;
        const thisMonthCustomer = this.statService.getMonthlyCustomers(this.customer);
        const newRecords = thisMonthCustomer.map((res: any) => {
          const allPlans = res?.plans?.map((p: any) => p.plan_name).join(', ');
          return { ...res, allPlans: allPlans };
        });

        this.thisMonthCustomer = newRecords;
        this.dtTrigger.next('');
        if (this.customer?.length > 0) {
          this.customerExist = true;
        } else {
          this.customerExist = false;
        }
      }), ((error: any) => {
        console.log(error);
      })
    } catch (error) {

    }
  }

  getAllTrxs() {
    try {
      this.loading = true;
      forkJoin([
        this.dataService.getMosaveTransactions(),
        this.dataService.getMosaveSavingTransactions()
      ]).subscribe((result: any) => {
        this.loading = false;
        this.showComponent = true;
        const newRecords = result[0].map((res: any) => {
          const type2 = res.transType == "S" ? res.transType + "avings" :
            res.transType == "W" ? res.transType + "ithdrawal" : res.transType + "";
          return { ...res, transType: type2 };
        })
        this.allRecords = newRecords;
        this.trnxRecords = newRecords;
        this.savingsRecords = this.allRecords.filter((item: any) => item.transType === 'Savings');
        this.savingsTrnxRecords = this.allRecords.filter((item: any) => item.transType === 'Savings');
        this.withdrawalRecords = this.allRecords.filter((item: any) => item.transType === 'Withdrawal');
        this.withTrnxRecords = this.allRecords.filter((item: any) => item.transType === 'Withdrawal');
        this.commissionRecords = this.allRecords.filter((item: any) => item.transType === "commission");
        this.commTrnxRecords = this.allRecords.filter((item: any) => item.transType === 'commission');
        this.savingsSum = this.savingsRecords.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
        //calculate the total withdrawals
        this.withdrawalSum = this.withdrawalRecords.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
        //calculate the total commissions
        this.commissionSum = this.commissionRecords.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
        this.totalBalance = this.savingsSum - this.withdrawalSum;
        this.bestSavers = this.statService.getBestStat(this.savingsRecords, this.savingsSum);
        this.bestAccountBalances = this.statService.getBestAccountHolder(this.allRecords, this.totalBalance)
        this.pieChartData = {
          labels: this.pieChartLabels,
          datasets: [{
            data: [this.withdrawalRecords?.length, this.savingsRecords?.length, this.commissionRecords?.length],
            backgroundColor: ['rgb(237,76,120)', 'rgb(0,201,167)', 'rgb(245,202,153)'],
            hoverBackgroundColor: ['rgb(201,65,102)', 'rgb(0,171,142)', 'rgb(247,210,168)'],
            borderColor: ['rgb(237,76,120)', 'rgb(0,201,167)', 'rgb(245,202,153)'],
            hoverBorderColor: ['rgb(201,65,102)', 'rgb(0,171,142)', 'rgb(247,210,168)'],
            hoverOffset: 4
          }],
        }

        const savingsPercent = this.decimalPipe.transform(this.savingsSum / (this.savingsSum + this.withdrawalSum) * 100, '1.0-1');
        const withdrawalPercent = this.decimalPipe.transform(this.withdrawalSum / (this.savingsSum + this.withdrawalSum) * 100, '1.0-1');

        this.doughnutHalfChartData = {
          labels: this.doughnutHalfChartLabels,
          datasets: [{
            data: [savingsPercent, withdrawalPercent],
            backgroundColor: ["#377dff", "rgba(55,125,255,.35)"],
            hoverBackgroundColor: ["#377dff", "rgba(55,125,255,.35)"],
            borderWidth: 4,
            borderColor: "#fff",
            hoverBorderColor: "#ffffff",
            circumference: 180,
            rotation: 270,
            cutout: '85%',
          }],
        }
        const labels = this.statService.getLastDays(this.dayDiff);
        const lastdaysSavings = this.statService.getNumberOfDaysTransaction(this.allRecords, this.dayDiff);
        const lastfewDays = this.statService.getTransactionByDays(lastdaysSavings);
        //const label = [];
        const label: any = [];
        const lab = new Array(lastfewDays.length).fill(null).map((x, i) => {
          label.push(moment(lastfewDays[i].transDate).format('MMM D YYYY'));
        })
        //const dates = new Array(lastfewDays.length).fill(null).map((x, i) => moment().subtract(9, 'days').add(i, 'days').format('MMM D'));
        //console.log(dates);
        const savings = [];
        const withdrawals = [];
        for (let i = 0; i < lastfewDays.length; i++) {
          const element = lastfewDays[i];
          savings.push(element?.savings);
          withdrawals.push(element?.withdraw);
        }
        this.savingsGraphSum = savings.length > 0 ? savings.reduce((acc: any, cur: any) => acc + cur) : 0;
        this.withdrawalGraphSum = withdrawals.length > 0 ? withdrawals.reduce((acc: any, cur: any) => acc + cur) : 0;
        this.barChartData = {
          labels: label, //dates,//labels, //() => { for (let i = 0; i < label.length; i++) { const element = label[i];}}, //labels, //["May 1", "May 2", "May 3", "May 4", "May 5", "May 6", "May 7", "May 8", "May 9", "May 10"], ////this.barChartLabels,
          datasets: [{
            label: 'Savings',
            data: savings,
            backgroundColor: "#377dff",
            hoverBackgroundColor: "#377dff",
            borderColor: "#377dff"
          },
          {
            label: 'Withdrawal',
            data: withdrawals,
            backgroundColor: "#e7eaf3",
            borderColor: "#e7eaf3"
          }
          ],
        }
        this.getCalculatedTransactions();
        this.filterDataByMonth(moment().format('MMM D, YYYY'));
      }), (error: any) => {
        console.log(error);
        this.loading = false;
        this.toastService.showError(error[0]?.message, 'Error');
      }

    } catch (error) {
      this.loading = false;
      console.log(error);
      this.toastService.showError('Please check your internet and refresh', 'Error');
    }
  }

  getChartConfig() {
    const val = [];
    const array = this.statService.getMonthDate();
    for (let i = 0; i < array.length; i++) {
      const element = array[i];
      const array2 = this.statService.getTransactionsByDays(this.savingsRecords, i);
      for (let ix = 0; ix < array2.length; ix++) {
        const el = array2[ix];
        const v = this.statService.calculateTransactions(array2);
        val.push(v);
      }
    }
  }


  getCalculatedTransactions() {
    const yesterdaySavings = this.statService.getYesterdayTransactions(this.savingsRecords);
    const yesterdayWithdrawal = this.statService.getYesterdayTransactions(this.withdrawalRecords);
    // const lastMonthSavings = this.statService.getYesterdayTransactions(this.savingsRecords);
    // const lastMonthWithdrawal = this.statService.getYesterdayTransactions(this.withdrawalRecords);
    const yesterdaySavingsSum = this.statService.calculateTransactions(yesterdaySavings);
    const yesterdayWithdrawalSum = this.statService.calculateTransactions(yesterdayWithdrawal);
    const yesterdayBalance = yesterdaySavingsSum - yesterdayWithdrawalSum;
    this.yesterdaytrnxSum = this.totalBalance - yesterdayBalance;
  }

  convertNum(number: any) {
    return Number(number);
  }

  getBase64(chartId: number) {
    //console.log(this.charts.get(chartId)?.toBase64Image());
    return this.charts.get(chartId)?.toBase64Image();
  }

  downloadGraph(chartId: number) {
    const fileName = this.charts.get(chartId)?.type + 'chart' + new Date().getTime() + '' + Math.floor(Math.random() * 10000) + '.png';
    const src = this.getBase64(chartId) + '';
    const link = document.createElement("a");
    link.href = src
    link.download = fileName
    link.click()
    link.remove()
  }

  switchTab(id: number, tab: string) {
    if (tab === 'savers') {
      this.saversTab = true
    } else {
      this.saversTab = false
    }
  }
  onChoose(value: string){
    this.maxCount = Number(value);
  }

  switchGraph(id: number, tab: string) {
    //console.log(this.charts);
    // const gradient1 = [
    //   [this.gradient, this.gradient2, this.gradient3],
    //   [this.gradient11, this.gradient12, this.gradient13]
    // ];
    const element = this.barChartData.datasets;
    if (tab === 'bar') {
      if (this.barChartType === 'line') {
        this.barChartType = 'bar';
        // for (let i = 0; i < element.length; i++) {
        //   element[i].backgroundColor = this.gradients[i][0];
        //   element[i].hoverBackgroundColor = this.gradients[i][0];        
        // }       
      }
    } else if (tab === 'line') {
      if (this.barChartType === 'bar') {
        this.barChartType = 'line'
        // for (let i = 0; i < element.length; i++) {
        //   element[i].backgroundColor = gradient1[0][i];  
        //   element[i].hoverBackgroundColor = gradient1[0][i];        
        // } 
      }
      this.charts.get(id)?.update();
    }

  }

  onSelect(value: string) {
    if (value === 'null' || value === 'All') value = '';
    // else {
    $("#datatable").DataTable().search(value, true, false, false).draw();
    // }
  }

  rerender(event: any) {
    var value = event.target.value;
    // this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
    $("#datatableSearch").on("keyup", function () {
      if (value === 'null') value = '';
      // if (dtInstance.search() !== value) {
      // dtInstance.search(value).draw();
      $("#datatable").DataTable().search(value).draw();
      //}
    });
    // });    
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) || this.isHovered(date)
    );
  }

  onSave() {
    const from = this.fromDate;
    const to = this.toDate;
    const fromDate = from.year + '-' + from.month + '-' + from.day;
    const toDate = to?.year + '-' + to?.month + '-' + to?.day;
    const format = from.year === to?.year ? 'MMM D' : 'MMM D, YYYY';
    const ev = {
      "start": moment(fromDate).startOf('day'),
      "end": moment(toDate).endOf('day'),
      "timeline": "Custom Range",
    }
    $('#js-daterangepicker-predefined .js-daterangepicker-predefined-preview').html(ev.start.format(format) + ' - ' + ev.end.format('MMM D, YYYY'));
    const startDate = ev.start.format('YYYY-MM-DD');
    const endDate = ev.end.format('YYYY-MM-DD');
    this.onChangeDate(startDate, endDate, ev.timeline);
    this.modalService.dismissAll('save changes');
  }

  download() {
    $('#export-excel').on('click', () => {
      $("#datatable").DataTable().button('.buttons-excel').trigger();
    });
    $('#export-print').on('click', () => {
      $("#datatable").DataTable().button('.buttons-print').trigger();
    });
    $('#export-csv').on('click', () => {
      $("#datatable").DataTable().button('.buttons-csv').trigger();
    });
    $('#export-pdf').on('click', () => {
      $("#datatable").DataTable().button('.buttons-pdf').trigger();
    });
    $('#export-copy').on('click', () => {
      $("#datatable").DataTable().button('.buttons-copy').trigger();
    });

    $('.js-datatable-filter').on('change', function (this: any) {
      var $this = $(this),
        elVal = $this.val(),
        targetColumnIndex = $this.data('target-column-index');
      if (elVal === 'null') elVal = '';
      $("#datatable").DataTable().column(targetColumnIndex).search(elVal, true, false, false).draw(false);
    });

    document.querySelectorAll('.js-datatable-filter2').forEach(function (item) {
      item.addEventListener('change', function (e) {
        var elVal = (e.target as HTMLSelectElement).value,
          targetColumnIndex = (e.target as HTMLSelectElement).getAttribute('data-target-column-index'),
          targetTable = (e.target as HTMLSelectElement).getAttribute('data-target-table');
        if (elVal === 'null') elVal = '';
        $("#datatable").DataTable().getItem(targetTable).column(targetColumnIndex).search(elVal, true, false, false).draw(false);
      })
    });
  }

  jsInit() {
    (function () {

      window.onload = function () {

        new HSSideNav('.js-navbar-vertical-aside').init()
        // INITIALIZATION OF FORM SEARCH
        // =======================================================

        // INITIALIZATION OF BOOTSTRAP DROPDOWN
        // =======================================================
        HSBsDropdown.init()

        // INITIALIZATION OF SELECT
        // =======================================================
        HSCore.components.HSTomSelect.init('.js-select')


        // INITIALIZATION OF CLIPBOARD
        // =======================================================
        HSCore.components.HSClipboard.init('.js-clipboard')

      }
    })()
  }

  jsOnLoad() {
    $(document).on('ready', function () {
    });
  }

}
