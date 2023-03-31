import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { AfterViewInit, Component, NgZone, OnInit, ViewChild } from '@angular/core';
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



declare var $:any;
declare var moment:any;
declare var HSCore:any;
declare var HSSideNav:any;
declare var HSFormSearch:any;
declare var HSBsDropdown:any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  dataTable:any;
  user: any;
  firstname!: string;
  customer!: Array<any>;
  thisMonthCustomer!: Array<any>;
  customerExist: boolean = false;
  date: any;
  imagePath: string  = environment.app.baseUrl+environment.app.imagePath;
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
  bestSavers !: Array<any>;
  savingsSum!: number;
  withdrawalSum!: number;
  commissionSum!: number;
  yesterdaytrnxSum!: number;
  totalBalance!: number;
  trnxMap: any = {'Savings': 'Deposit', 'Withdrawal': 'Withdrawal', 'commission': 'Commission'};


  @ViewChild(DataTableDirective, {static: false})
  datatableElement: any = DataTableDirective;

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    aspectRatio: 1.4,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      // datalabels: {
      //   formatter: (value, ctx) => {
      //     if (ctx.chart.data.labels) {
      //       return ctx.chart.data.labels[ctx.dataIndex];
      //     }
      //   },
      // },
    }
  };

  public pieChartLabels = ['Withdrawal', 'Savings', 'Commissions'];
  public pieChartData!: any; 
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public doughnutHalfChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    aspectRatio: 1,
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
      // tooltips: {
      //    postfix: "%"
      // },
    }
  };
  // public jjjs: DoughnutControllerChartOptions = {
  //   circumference: Math.PI,
  //   rotation: Math.PI,
  //   cutout: 85,
  // }
  public doughnutHalfChartType: ChartType = 'doughnut';
  public doughnutHalfChartLabels = ["Savings", "Withdrawal"];
  public doughnutHalfChartData!: any; 
  

  constructor(private authservice: AuthService, 
    private dataService: DataService, private statService: StatService, private toastService: ToastService, private ngZone: NgZone,
    private decimalPipe: DecimalPipe
    ) {
      //Chart.register(Annotation)
     }

  ngOnInit(): void {
    this.getUserDetails();
    this.getAllCustomers();
    this.getAllTrxs();
    //$('#datatable').DataTable();
    //this.jsOnLoad();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 15,
      processing: true,
      language: {
        zeroRecords: `<div class="text-center p-4">
            <img class="mb-3" src="./assets/svg/illustrations/oc-error.svg" alt="Image Description" style="width: 10rem;" data-hs-theme-appearance="default">
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

  ngAfterViewInit(){
    this.jsInit();
  }

  onChangeDate(startDate: any, endDate: any, timeline?: string) {
    if (this.savingsTrnxRecords != null || this.savingsTrnxRecords != undefined) {
      this.ngZone.run(() => {
        this.savingsRecords = timeline === 'All' ? this.savingsTrnxRecords : this.filterDate(startDate, endDate, this.savingsTrnxRecords);
        this.withdrawalRecords = timeline === 'All' ? this.withTrnxRecords : this.filterDate(startDate, endDate, this.withTrnxRecords); 
        this.commissionRecords = timeline === 'All' ? this.commTrnxRecords : this.filterDate(startDate, endDate, this.commTrnxRecords);
        this.randomize(this.withdrawalRecords, this.savingsRecords, this.commissionRecords);
      });
    }
  }

  filterDate(startDate: any, endDate: any, record: Array<any>){
    return record.filter((m: any) => new Date(m.transDate) >= new Date(startDate) && new Date(m.transDate) <= new Date(endDate));
  }

  public randomize(withdrawalRecords: any, savingsRecords: any, commissionRecords: any): void {
    for (let i = 0; i < this.pieChartData.datasets.length; i++) {
        this.pieChartData.datasets[i].data[0] = withdrawalRecords?.length;
        this.pieChartData.datasets[i].data[1] = savingsRecords?.length;
        this.pieChartData.datasets[i].data[2] = commissionRecords?.length;
    }
    this.chart?.update();
  }
  ranges = {
    'TodayWithFormat': [moment('').format('MMM D'), moment().format('MMM D, YYYY')],
  }

  dateRanges = [
    {
      timeline: 'All',
      date: [moment('2022-04-07'), moment()]
    },
    {
      timeline: 'Today',
      date: [moment(), moment()]
    },
    {
      timeline: 'Yesterday',
      date: [moment().subtract(1, 'days'), moment().subtract(1, 'days')]
    },
    {
      timeline: 'Last 7 Days',
      date: [moment().subtract(6, 'days'), moment()]
    },
    {
      timeline: 'Last 30 Days',
      date: [moment().subtract(29, 'days'), moment()],
    },
    {
      timeline: 'This Month',
      date: [moment().startOf('month'), moment().endOf('month')],
    },
    {
      timeline: 'Last Month',
      date: [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    }
    
    
]

  // var start = moment();
  //     var end = moment();

  filterDataByDate(start: any, end:any, timeline?: string) {
    const format = timeline === 'All' ? 'MMM D, YYYY' : 'MMM D';
    $('#js-daterangepicker-predefined .js-daterangepicker-predefined-preview').html(start.format(format) + ' - ' + end.format('MMM D, YYYY'));
    const startDate = start.format('YYYY-MM-DD');
    const endDate = end.format('YYYY-MM-DD');
     this.onChangeDate(startDate, endDate, timeline);
  }


  getUserDetails(){
    this.authservice.userData$.subscribe((response: any) => {
      this.user = response;
      var titleCasePipe = new TitleCasePipe();
      this.firstname = titleCasePipe.transform(this.user?.firstname);
    });
  }

  getAllCustomers(){ 
    this.dataService.getAllcustomers().subscribe((data: any) =>{
      console.log(data);
      this.customer = data;
      const thisMonthCustomer  = this.statService.getMonthlyCustomers(this.customer);
      const newRecords = thisMonthCustomer.map((res: any) => {
        const allPlans = res?.plans?.map((p:any) => p.plan_name).join(', ');
        return { ...res, allPlans: allPlans };
      });

      this.thisMonthCustomer = newRecords;
      this.dtTrigger.next('');
      if(this.customer?.length > 0 ){
        this.customerExist = true;
      }else {
        this.customerExist = false;
      }
    }),((error: any)=>{
      console.log(error);
    })
  }

  getAllTrxs() {
    try {
      forkJoin([
        this.dataService.getMosaveTransactions(),
        this.dataService.getMosaveSavingTransactions()
      ]).subscribe((result: any) => {
        console.log(result[0]);
        console.log(result[1]);
        const newRecords = result[0].map((res: any) => {
          const type2 = res.transType == "S" ? res.transType + "avings" : 
          res.transType == "W" ? res.transType + "ithdrawal" : res.transType + "";
          // if (res.transType == "S") {
          //   var type = res.transType + "avings";
          // } else if (res.transType == "W") {
          //   var type = res.transType + "ithdrawal";
          // } else {
          //   var type = res.transType + "";
          // }
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
        this.pieChartData = {
          labels: this.pieChartLabels,
          datasets: [{
            data: [this.withdrawalRecords?.length, this.savingsRecords?.length, this.commissionRecords?.length],
            backgroundColor: ['rgb(237,76,120)', 'rgb(0,201,167)', 'rgb(245,202,153)'],
            hoverBackgroundColor: ['rgb(201,65,102)', 'rgb(0,171,142)', 'rgb(247,210,168)'],
            borderColor: ['rgb(237,76,120)', 'rgb(0,201,167)', 'rgb(245,202,153)'],
            hoverBorderColor:['rgb(201,65,102)', 'rgb(0,171,142)', 'rgb(247,210,168)'],
            hoverOffset: 4
          }],
        }
        
        const savingsPercent = this.decimalPipe.transform(this.savingsSum / (this.savingsSum +  this.withdrawalSum)  * 100, '1.0-1');
        const withdrawalPercent = this.decimalPipe.transform(this.withdrawalSum / (this.savingsSum +  this.withdrawalSum) * 100, '1.0-1');

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
        this.getCalculatedTransactions();
      }), (error: any) => {
        console.log(error);
        this.toastService.showError(error[0]?.message, 'Error');
      }
      
    } catch (error) {
      this.toastService.showError('Please check your internet and refresh', 'Error');
      
    }
    

  }

  getCalculatedTransactions(){
    const yesterdaySavings = this.statService.getYesterdayTransactions(this.savingsRecords);
    const yesterdayWithdrawal = this.statService.getYesterdayTransactions(this.withdrawalRecords);
    // const lastMonthSavings = this.statService.getYesterdayTransactions(this.savingsRecords);
    // const lastMonthWithdrawal = this.statService.getYesterdayTransactions(this.withdrawalRecords);
    console.log(yesterdaySavings);
    console.log(yesterdayWithdrawal);
    const yesterdaySavingsSum = this.statService.calculateTransactions(yesterdaySavings);
    const yesterdayWithdrawalSum = this.statService.calculateTransactions(yesterdayWithdrawal);
    const yesterdayBalance = yesterdaySavingsSum - yesterdayWithdrawalSum;    
    this.yesterdaytrnxSum = this.totalBalance - yesterdayBalance;
    console.log(this.yesterdaytrnxSum);
  }

  getBase64() {
    return this.chart?.toBase64Image();
  }

  downloadGraph(){
    const fileName = new Date().getTime()+''+Math.floor(Math.random() * 10000) + '.png';
    const src = this.getBase64()+'';
    const link = document.createElement("a");
    link.href = src
    link.download = fileName
    link.click()
    link.remove()
  }

  downloadDoughnut(){
    this.downloadGraph();
    }

    downloadPie(){
      this.downloadGraph();
    }

  rerender(event: any){
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

  download(){
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

    $('.js-datatable-filter').on('change', function(this: any) {
      var $this = $(this),        
        elVal = $this.val(),
        targetColumnIndex = $this.data('target-column-index');
      if (elVal === 'null') elVal = '';
      $("#datatable").DataTable().column(targetColumnIndex).search(elVal, true, false, false).draw(false);
    });

    document.querySelectorAll('.js-datatable-filter2').forEach(function (item) {
      item.addEventListener('change',function(e) {
        var elVal = (e.target as HTMLSelectElement).value,
    targetColumnIndex = (e.target as HTMLSelectElement).getAttribute('data-target-column-index'),
    targetTable = (e.target as HTMLSelectElement).getAttribute('data-target-table');
   if (elVal === 'null') elVal = '';
    $("#datatable").DataTable().getItem(targetTable).column(targetColumnIndex).search(elVal, true, false, false).draw(false);
      })
    }); 
  }


  
  jsInit(){
    (function() {
    
    window.onload = function () {

      new HSSideNav('.js-navbar-vertical-aside').init()
    // INITIALIZATION OF FORM SEARCH
      // =======================================================

      // INITIALIZATION OF BOOTSTRAP DROPDOWN
      // =======================================================
      HSBsDropdown.init()

      const HSFormSearchInstance = new HSFormSearch('.js-form-search');      

      if (HSFormSearchInstance.collection.length) {
        HSFormSearchInstance.getItem(1).on('close', function (el:any) {
          el.classList.remove('top-0')
        })

        document.querySelector('.js-form-search-mobile-toggle')?.addEventListener('click', (e:any) => {
          //const el = e.currentTarget as HTMLInputElement
          let dataOptions = JSON.parse(e.currentTarget?.getAttribute('data-hs-form-search-options')),
            $menu = document.querySelector(dataOptions.dropMenuElement);
          $menu.classList.add('top-0')
          $menu.style.left = 0
        })
      };

          // INITIALIZATION OF SELECT
      // =======================================================
      HSCore.components.HSTomSelect.init('.js-select')


      // INITIALIZATION OF CLIPBOARD
      // =======================================================
      HSCore.components.HSClipboard.init('.js-clipboard')

      // INITIALIZATION OF CHARTJS
        // =======================================================
        // HSCore.components.HSChartJS.init('.js-chart-datalabels', {
        //   plugins: [ChartDataLabels],
        //   options: {
        //     plugins: {
        //       datalabels: {
        //         anchor: (context: any) => {
        //           var value = context.dataset.data[context.dataIndex];
        //           return value.r < 20 ? 'end' : 'center';
        //         },
        //         align: (context: any) => {
        //           var value = context.dataset.data[context.dataIndex];
        //           return value.r < 20 ? 'end' : 'center';
        //         },
        //         color: (context: any) => {
        //           var value = context.dataset.data[context.dataIndex];
        //           return value.r < 20 ? context.dataset.backgroundColor : context.dataset.color;
        //         },
        //         font: (context: any) => {
        //           var value = context.dataset.data[context.dataIndex],
        //             fontSize = 25;

        //           if (value.r > 50) {
        //             fontSize = 35;
        //           }

        //           if (value.r > 70) {
        //             fontSize = 55;
        //           }

        //           return {
        //             weight: 'lighter',
        //             size: fontSize
        //           };
        //         },
        //         offset: 2,
        //         padding: 0
        //       }
        //     }
        //   }
        // })



      
    // INITIALIZATION OF DATATABLES
    // =======================================================
    // HSCore.components.HSDatatables.init($('#datatable'), {
    //   select: {
    //     style: 'multi',
    //     selector: 'td:first-child input[type="checkbox"]',
    //     classMap: {
    //       checkAll: '#datatableCheckAll',
    //       counter: '#datatableCounter',
    //       counterInfo: '#datatableCounterInfo'
    //     }
    //   },
    //   language: {
    //     zeroRecords: `<div class="text-center p-4">
    //           <img class="mb-3" src="./assets/svg/illustrations/oc-error.svg" alt="Image Description" style="width: 10rem;" data-hs-theme-appearance="default">
    //           <img class="mb-3" src="./assets/svg/illustrations-light/oc-error.svg" alt="Image Description" style="width: 10rem;" data-hs-theme-appearance="dark">
    //         <p class="mb-0">No data to show</p>
    //         </div>`
    //   }
    // });

    // const datatable = HSCore.components.HSDatatables.getItem(0);
    // console.log(datatable);

    // document.querySelectorAll('.js-datatable-filter').forEach(function (item) {
    //   item.addEventListener('change',function(e) {
    //     const elVal = (e.target as HTMLSelectElement).value,
    // targetColumnIndex = (e.target as HTMLSelectElement) .getAttribute('data-target-column-index'),
    // targetTable = (e.target as HTMLSelectElement).getAttribute('data-target-table');

    // HSCore.components.HSDatatables.getItem(targetTable).column(targetColumnIndex).search(elVal !== 'null' ? elVal : '').draw()
    //   })
    // });    
    }
  })()
  }

  jsOnLoad() {
    $(document).on('ready', function () {
    });
  }

}
