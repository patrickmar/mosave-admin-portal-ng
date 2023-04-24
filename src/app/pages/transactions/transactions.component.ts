import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, QueryList, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { forkJoin, Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ReceiptService } from 'src/app/services/receipt.service';
import { StatService } from 'src/app/services/stat.service';
import { environment } from 'src/environments/environment';
//import { moment} from 'moment';
//import * as moment from 'moment';
//import moment = require('moment');
declare var $: any;
declare var moment: any;
declare var HSCore: any;
declare var HSSideNav: any;
declare var HSFormSearch: any;
declare var HSBsDropdown: any;
declare var HsNavScroller: any;

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit, OnDestroy, AfterViewInit {

  // @ViewChild(DataTableDirective, {static: false})  
  @ViewChild(DataTableDirective)
  dtElements!: QueryList<DataTableDirective>;
  datatableElement: any = DataTableDirective;

  //dtOptions: DataTables.Settings = {};
  //dtOptions: DataTables.Settings[] = [];
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();

  transactionType!: any;
  records!: Array<any>;
  recordsExist: boolean = false;
  user: any;
  allRecords: any;
  trnxRecords: any;
  savingsRecords: any;
  withdrawalRecords: any;
  commissionRecords: any;
  customerId!: number;
  modalContent!: object | any;

  totalSum!: number;
  savingsSum!: number;
  withdrawalSum!: number;
  commissionSum!: number;

  savingsSumPerWeek!: number;
  savingsSumPerMonth!: number;

  commissionSumPerWeek!: number;
  commissionSumPerMonth!: number;

  withdrawalSumPerWeek!: number;
  withdrawalSumPerMonth!: number;

  thisMonthCommission!: any;
  thisMonthSavings!: any;
  thisMonthWithdrawal!: any

  savingsSumMonthly!: number;
  withdrawalSumMonthly!: number;
  commissionSumMonthly!: number;

  thisDay!: any;
  thisDaySavings!: any;
  thisDayWithdrawals!: any;
  thisDayCommissions!: any;

  savingsSumDaily!: number;
  withdrawalSumDaily!: number;
  commissionSumDaily!: number;

  thisWeekSavings!: any;
  thisWeekWithdrawals!: any;
  thisWeekCommissions!: any;

  savingsSumWeekly!: number;
  withdrawalSumWeekly!: number;
  commissionSumWeekly!: number;

  r!: any;
  tableHead!: { id: number; name: string; }[];
  savingsTrnxRecords: any;
  withTrnxRecords: any;
  commTrnxRecords: any;

  bestSavers!: Array<any>;
  emptyTable = environment.emptyTable;

  // @ViewChild(TransactionsTableComponent)
  // private btnIcon: btn;
  // @ViewChild('TransactionsTableComponent', {static: false}) TransactionsTableComponent: any;

  constructor(private dataService: DataService, private datePipe: DatePipe,
    private receiptService: ReceiptService, private modalService: NgbModal,
    private cdr: ChangeDetectorRef, private ngZone: NgZone, private route: ActivatedRoute,
    private statService: StatService) { }

  ngOnInit(): void {
    // this.jsInit();
    // this.jsOnLoad();
    this.getTableHead();
    this.getTransactionType();
    //this.dtOptions
    var time = new Date().getTime();

    const dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 20,
      processing: true,
      language: {
        zeroRecords: `<div class="text-center p-4">
            <img class="mb-3" src="${this.emptyTable}" alt="Image Description" style="width: 10rem;" data-hs-theme-appearance="default">
          <p class="mb-0">No data to show</p>
          </div>`,
      },
      lengthMenu: [10, 15, 20],
      // select: true,
      dom: 'Brtip',
      buttons: [
        {
          extend: 'copy',
          className: 'd-none'
        },
        {
          extend: 'print',
          className: 'd-none'
        },
        {
          extend: 'excel',
          className: 'd-none',
          filename: function () {
            return 'MoSave_report_' + new Date().getTime();
          }
        },
        {
          extend: 'csv',
          className: 'd-none',
          filename: function () {
            return 'MoSave_report_' + new Date().getTime();
          }
        },
        {
          extend: 'pdf',
          className: 'd-none',
          filename: function () {
            return 'MoSave_report_' + new Date().getTime();
          }
        },
      ],
      info: true,
      lengthChange: true,
    };
    this.dtOptions[0] = dtOptions;
    this.dtOptions[1] = dtOptions;
    this.dtOptions[2] = dtOptions;
    this.dtOptions[3] = dtOptions;
    //this.download();
    this.getAllTrxs();
    //this.cdr.detectChanges();
  }

  

  ngAfterViewInit(): void {
    //this.dtTrigger.next('');

    this.jsInit();
    this.jsOnLoad();
  }

  ngOnDestroy(): void {
    // We will unsubscribe the even
    this.dtTrigger.unsubscribe();
  }

  getTransactionType() {
    this.transactionType = this.route.snapshot.paramMap.get('type');
    console.log(this.transactionType);
  }

  displayToConsole(): void {
    this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
      dtElement.dtInstance.then((dtInstance: any) => {
        console.log(`The DataTable ${index} instance ID is: ${dtInstance.table().node().id}`);
      });
    });
  }
  rerender(event: any, id: number) {
    var value = event.target.value;
    this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {

    });
  }

  filter(event: any, tableid: number, tableName: string,) {
    var value = event.target.value;
    // this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
    $("#datatableSearch" + tableid).on("keyup", function () {
      if (value === 'null') value = '';
      $("#" + tableName).DataTable().search(value).draw();
      // if (dtInstance.search() !== value) {
      //   dtInstance.search(value).draw();          
      // }
    });
    // });
  }

  filter2(event: any, id: number) {
    var value = event.target.value;
    this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
      dtElement.dtInstance.then((dtInstance: any) => {
        console.log(`The DataTable ${id} instance ID is: ${dtInstance.table().node().id}`);
        if (dtInstance.table().node().id == id) {
          $("#datatableSearch").on("keyup", function () {
            if (value === 'null') value = '';
            if (dtInstance.search() !== value) {
              dtInstance.search(value).draw();
            }
          });
        } else if (dtInstance.table().node().id == id) {
          $("#datatableSearch").on("keyup", function () {
            if (value === 'null') value = '';
            if (dtInstance.search() !== value) {
              dtInstance.search(value).draw();
            }
          });
        }

      });
    });
  }

  rerenderForATable(event: any) {
    var value = event.target.value;
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      $("#datatableSearch").on("keyup", function () {
        if (value === 'null') value = '';
        if (dtInstance.search() !== value) {
          dtInstance.search(value).draw();
          //$("#datatable").DataTable().search(value).draw();
        }
      });
    });
  }
  // ngAfterViewInit() {  
  //   this.cdr.detectChanges();  
  // }
  // ngOnChanges() {
  //   this.cdr.detectChanges();
  // }

  downloadAll(tableName: string, name: string) {
    var table = "#" + tableName;
    $(table).DataTable().button('.buttons-' + name).trigger();
  }

  getAllTrxs() {
    forkJoin([
      this.dataService.getMosaveTransactions(),
      this.dataService.getMosaveSavingTransactions()
    ]).subscribe((result: any) => {
      console.log(result[0]);
      console.log(result[1]);
      const newRecords = result[0].map((res: any) => {
        if (res.transType == "S") {
          var type = res.transType + "avings";
        } else if (res.transType == "W") {
          var type = res.transType + "ithdrawal";
        } else {
          var type = res.transType + "";
        }
        return { ...res, transType: type };
      })
      this.allRecords = newRecords;
      this.trnxRecords = newRecords;
      //this.dtTrigger.next(this.allRecords);

      const newSavingsRecords = result[1].map((res: any) => {
        if (res.transType == "S") {
          var type = res.transType + "avings";
        } else {
          var type = res.transType + "";
        }
        return { ...res, transType: type };
      })
      //this.savingsRecords = newSavingsRecords;
      this.savingsRecords = this.allRecords.filter((item: any) => item.transType === 'Savings');
      this.savingsTrnxRecords = this.allRecords.filter((item: any) => item.transType === 'Savings');
      this.withdrawalRecords = this.allRecords.filter((item: any) => item.transType === 'Withdrawal');
      this.withTrnxRecords = this.allRecords.filter((item: any) => item.transType === 'Withdrawal');
      this.commissionRecords = this.allRecords.filter((item: any) => item.transType === "commission");
      this.commTrnxRecords = this.allRecords.filter((item: any) => item.transType === 'commission');
      this.dtTrigger.next('');


      let date = new Date();
      // let today = date.setDate(date.getDate() - 0);
      // let yesterday = date.setDate(date.getDate() - 1);
      // let lastweek = date.setDate(date.getDate() - 7);

      const endDate4 = this.datePipe.transform(new Date().setDate(new Date().getDate()), 'YYYY-MM-dd');
      console.log(endDate4);
      console.log(date.getDate());
      let d = new Date();
      const today5 = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
      console.log(today5);

      this.getDailyTransactions();
      this.getMonthlyTransactions();
      this.getWeeklyTransactions();

      this.calculateAllTransactions();
      this.calculateDailyTransactions();
      this.calculateMonthlyTransactions();
      this.calculateWeeklyTransactions();

      this.bestSavers = this.statService.getBestStat(this.savingsRecords, this.savingsSum);

    }), (error: any) => {
      console.log(error);
    }

  }

  calculateAllTransactions() {
    //calculate the total savings
    this.savingsSum = this.savingsRecords.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    console.log(this.savingsSum);

    //calculate the total withdrawals
    this.withdrawalSum = this.withdrawalRecords.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    console.log(this.withdrawalSum);

    //calculate the total commissions
    this.commissionSum = this.commissionRecords.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    console.log(this.commissionSum);
  }

  getDailyTransactions() {
    //Filter Today's transactions for savings, withdrawal and commission
    const day = this.datePipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd');
    console.log(day);
    this.thisDaySavings = this.savingsRecords.filter((x: any) => x.transDate == day);
    console.log(this.thisDaySavings);
    this.thisDayWithdrawals = this.withdrawalRecords.filter((x: any) => x.transDate == day);
    console.log(this.thisDayWithdrawals);
    this.thisDayCommissions = this.commissionRecords.filter((x: any) => x.transDate == day);
    console.log(this.thisDayCommissions);
  }

  getMonthlyTransactions() {
    const startOfMonth = moment().startOf('month').format();
    const endOfMonth = moment().endOf('month').format();
    this.thisMonthSavings = this.savingsRecords.filter((m: any) => new Date(m.transDate + " " + m.time) >= new Date(startOfMonth) && new Date(m.transDate + " " + m.time) <= new Date(endOfMonth));
    console.log(this.thisMonthSavings);
    this.thisMonthWithdrawal = this.withdrawalRecords.filter((m: any) => new Date(m.transDate + " " + m.time) >= new Date(startOfMonth) && new Date(m.transDate + " " + m.time) <= new Date(endOfMonth));
    console.log(this.thisMonthWithdrawal);
    this.thisMonthCommission = this.commissionRecords.filter((m: any) => new Date(m.transDate + " " + m.time) >= new Date(startOfMonth) && new Date(m.transDate + " " + m.time) <= new Date(endOfMonth));
    console.log(this.thisMonthCommission);
  }

  getWeeklyTransactions() {
    const startOfWeek = moment().startOf('week').format();
    const endOfWeek = moment().endOf('week').format();
    this.thisWeekSavings = this.savingsRecords.filter((m: any) => new Date(m.transDate + " " + m.time) >= new Date(startOfWeek) && new Date(m.transDate + " " + m.time) <= new Date(endOfWeek));
    this.thisWeekWithdrawals = this.withdrawalRecords.filter((m: any) => new Date(m.transDate + " " + m.time) >= new Date(startOfWeek) && new Date(m.transDate + " " + m.time) <= new Date(endOfWeek));
    this.thisWeekCommissions = this.commissionRecords.filter((m: any) => new Date(m.transDate + " " + m.time) >= new Date(startOfWeek) && new Date(m.transDate + " " + m.time) <= new Date(endOfWeek));
  }

  calculateDailyTransactions() {
    //calculate the total savings per day
    this.savingsSumDaily = this.thisDaySavings.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    console.log(this.savingsSumDaily);

    //calculate the total withdrawals per day
    this.withdrawalSumDaily = this.thisDayWithdrawals.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    console.log(this.withdrawalSumDaily);

    //calculate the total commissions per day
    this.commissionSumDaily = this.thisDayCommissions.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    console.log(this.commissionSumDaily);
  }


  calculateMonthlyTransactions() {
    //calculate the total savings per month
    this.savingsSumMonthly = this.thisMonthSavings.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    console.log(this.savingsSumMonthly);

    //calculate the total withdrawals per month
    this.withdrawalSumMonthly = this.thisMonthWithdrawal.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    console.log(this.withdrawalSumMonthly);

    //calculate the total commissions per month
    this.commissionSumMonthly = this.thisMonthCommission.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    console.log(this.commissionSumMonthly);
  }

  calculateWeeklyTransactions() {
    //calculate the total savings per week
    this.savingsSumWeekly = this.thisWeekSavings.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    console.log(this.savingsSumWeekly);

    //calculate the total withdrawal per week
    this.withdrawalSumWeekly = this.thisWeekWithdrawals.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    console.log(this.withdrawalSumWeekly);

    //calculate the total commissions per week
    this.commissionSumWeekly = this.thisWeekCommissions.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    console.log(this.commissionSumWeekly);
  }

  onChange(startDate: any, endDate: any) {
    if (this.trnxRecords != null || this.trnxRecords != undefined) {
      // setTimeout(() => {
      //   // we do not need to trigger change detection manually      
      // });
      this.ngZone.run(() => {
        this.allRecords = this.trnxRecords.filter((m: any) => new Date(m.transDate) >= new Date(startDate) && new Date(m.transDate) <= new Date(endDate));
        console.log(this.allRecords);
      });
    }

  }

  onChangeSav(startDate: any, endDate: any) {
    if (this.savingsTrnxRecords != null || this.savingsTrnxRecords != undefined) {
      this.ngZone.run(() => {
        this.savingsRecords = this.savingsTrnxRecords.filter((m: any) => new Date(m.transDate) >= new Date(startDate) && new Date(m.transDate) <= new Date(endDate));
        console.log(this.savingsRecords);
      });
      var tableName = "savingsDatatable";
      // $("#"+tableName).DataTable().search(this.savingsRecords).draw();
    }
  }

  onChangeWith(startDate: any, endDate: any) {
    if (this.withTrnxRecords != null || this.withTrnxRecords != undefined) {
      this.ngZone.run(() => {
        this.withdrawalRecords = this.withTrnxRecords.filter((m: any) => new Date(m.transDate) >= new Date(startDate) && new Date(m.transDate) <= new Date(endDate));
        console.log(this.withdrawalRecords);
      });
      this.dtTrigger.next('');
    }
  }

  onChangeComm(startDate: any, endDate: any) {
    if (this.commTrnxRecords != null || this.commTrnxRecords != undefined) {
      this.ngZone.run(() => {
        this.commissionRecords = this.commTrnxRecords.filter((m: any) => new Date(m.transDate) >= new Date(startDate) && new Date(m.transDate) <= new Date(endDate));
        console.log(this.commissionRecords);
      });
      this.dtTrigger.next('');
    }
  }

  getAllDates() {
    let date = new Date();
    let today = this.datePipe.transform(date, 'yyyy-MM-dd');
    let yesterday = this.datePipe.transform(date.setDate(date.getDate() - 1), 'yyyy-MM-dd');
    let lastWeek = this.datePipe.transform(date.setDate(date.getDate() - 7), 'yyyy-MM-dd');
    let lastMonth = this.datePipe.transform(date.setDate(date.getDate() - 30), 'yyyy-MM-dd');
    let lastThreeMonths = this.datePipe.transform(date.setDate(date.getDate() - 90), 'yyyy-MM-dd');
    let lastSixMonths = this.datePipe.transform(date.setDate(date.getDate() - 180), 'yyyy-MM-dd');
    console.log(today, yesterday, lastWeek, lastMonth, lastThreeMonths, lastSixMonths);
  }

  printReceipt(customerTrxs: any) {
    this.receiptService.printPdf(customerTrxs, this.user);
  }

  openReceipt(customerTrxs: any) {
    this.receiptService.openPdf(customerTrxs, this.user);
  }

  open(content: any, tableRow: any) {
    console.log(content);
    console.log(tableRow);
    this.modalContent = tableRow;
    this.modalService.open(content);
  }

  download() {
    $('#export-excel').on('click', () => {
      $("#datatable").DataTable().button('.buttons-excel').trigger();
    });

    $('.js-datatable-filter').on('change', function (this: any) {
      var $this = $(this),
        elVal = $this.val(),
        targetColumnIndex = $this.data('target-column-index');
      if (elVal === 'null') elVal = '';
      $("#datatable").DataTable().column(targetColumnIndex).search(elVal, true, false, false).draw(false);
    });

    // const datatable = $("#datatable").DataTable();

    // $('.js-datatable-filter').on('change', function (this: any) {
    //   var $this = $(this),
    //     elVal = $this.val(),
    //     targetColumnIndex = $this.data('target-column-index');

    //   datatable.column(targetColumnIndex).search(elVal).draw();
    // });

    // $('#datatableSearch').on('mouseup', function (this: any) {
    //   var $input = $(this),
    //     oldValue = $input.val();

    //   if (oldValue == "") return;

    //   setTimeout(function () {
    //     var newValue = $input.val();

    //     if (newValue == "") {
    //       // Gotcha
    //       datatable.search('').draw();
    //     }
    //   }, 1);
    // });

    // $('#toggleColumn_ref').change(function (e: any) { 
    //   datatable.columns(1).visible(e.target.checked)
    // })

    // $('#toggleColumn_customer').change(function (e: any) {
    //   datatable.columns(2).visible(e.target.checked)
    // })

    // $('#toggleColumn_amount').change(function (e: any) {
    //   datatable.columns(3).visible(e.target.checked)
    // })

    // $('#toggleColumn_plan').change(function (e: any) {
    //   datatable.columns(4).visible(e.target.checked)
    // })

    // $('#toggleColumn_transaction_type').change(function (e: any) {
    //   datatable.columns(5).visible(e.target.checked)
    // })

    // $('#toggleColumn_date').change(function (e: any) {
    //   datatable.columns(6).visible(e.target.checked)
    // })

    // datatable.columns(7).visible(false)

    // $('#toggleColumn_phone_no').change(function (e: any) {
    //   datatable.columns(7).visible(e.target.checked)
    // })

    // $('#toggleColumn_actions').change(function (e: any) {
    //   datatable.columns(8).visible(e.target.checked)
    // })
  }

  getTableHead() {
    this.tableHead = [
      {

        id: 1,
        name: "Reference"
      },
      {
        id: 2,
        name: "Customer"
      },
      {
        id: 3,
        name: "Amount"
      },
      {
        id: 4,
        name: "Plan"
      },
      {
        id: 5,
        name: "Transaction Type"
      },
      {
        id: 6,
        name: "Date"
      },
      {
        id: 7,
        name: "Performed By"
      },
      {
        id: 8,
        name: "Actions"
      }
    ];
  }


  jsInit() {
    var self = this;
    $(document).on('ready', function () {
      // INITIALIZATION OF DATATABLES
      // =======================================================
      // HSCore.components.HSDatatables.init($('#datatable'), {
      //   dom: 'Bfrtip',
      //   buttons: [
      //     {
      //       extend: 'copy',
      //       className: 'd-none'
      //     },
      //     {
      //       extend: 'excel',
      //       className: 'd-none'
      //     },
      //     {
      //       extend: 'csv',
      //       className: 'd-none'
      //     },
      //     {
      //       extend: 'pdf',
      //       className: 'd-none'
      //     },
      //     {
      //       extend: 'print',
      //       className: 'd-none'
      //     },
      //   ],
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
      //         <img class="mb-3" src="${this.emptyTable}" alt="Image Description" style="width: 10rem;" data-hs-theme-appearance="default">
      //         <img class="mb-3" src="./assets/svg/illustrations-light/oc-error.svg" alt="Image Description" style="width: 10rem;" data-hs-theme-appearance="dark">
      //       <p class="mb-0">No data to show</p>
      //       </div>`
      //   }
      // });

      //const datatable = HSCore.components.HSDatatables.getItem('datatable');
      // const datatable = $("#datatable").DataTable();

      // $('.js-datatable-filter').on('change', function (this: any) {
      //   var $this = $(this),
      //     elVal = $this.val(),
      //     targetColumnIndex = $this.data('target-column-index');

      //   datatable.column(targetColumnIndex).search(elVal).draw();
      // });

      // $('#datatableSearch').on('mouseup', function (this: any) {
      //   var $input = $(this),
      //     oldValue = $input.val();

      //   if (oldValue == "") return;

      //   setTimeout(function () {
      //     var newValue = $input.val();

      //     if (newValue == "") {
      //       // Gotcha
      //       datatable.search('').draw();
      //     }
      //   }, 1);
      // });

      // $('#toggleColumn_ref').change(function (e: any) { 
      //   datatable.columns(1).visible(e.target.checked)
      // })

      // $('#toggleColumn_customer').change(function (e: any) {
      //   datatable.columns(2).visible(e.target.checked)
      // })

      // $('#toggleColumn_amount').change(function (e: any) {
      //   datatable.columns(3).visible(e.target.checked)
      // })

      // $('#toggleColumn_plan').change(function (e: any) {
      //   datatable.columns(4).visible(e.target.checked)
      // })

      // $('#toggleColumn_transaction_type').change(function (e: any) {
      //   datatable.columns(5).visible(e.target.checked)
      // })

      // $('#toggleColumn_date').change(function (e: any) {
      //   datatable.columns(6).visible(e.target.checked)
      // })

      // datatable.columns(7).visible(false)

      // $('#toggleColumn_phone_no').change(function (e: any) {
      //   datatable.columns(7).visible(e.target.checked)
      // })

      // $('#toggleColumn_actions').change(function (e: any) {
      //   datatable.columns(8).visible(e.target.checked)
      // })






      // INITIALIZATION OF DATERANGEPICKER
      // =======================================================
      // $('.js-daterangepicker').daterangepicker();

      $('.js-daterangepicker-times').daterangepicker({
        timePicker: true,
        startDate: moment().startOf('hour'),
        endDate: moment().startOf('hour').add(32, 'hour'),
        locale: {
          format: 'M/DD hh:mm A'
        }
      });

      var start = moment();
      var end = moment();

      // function to filter the all transactions per date
      function cb(start: any, end: any) {
        $('#js-daterangepicker-predefined1 .js-daterangepicker-predefined1-preview').html(start.format('MMM D') + ' - ' + end.format('MMM D, YYYY'));
        const startDate = start.format('YYYY-MM-DD');
        const endDate = end.format('YYYY-MM-DD');
        console.log(startDate);
        console.log(endDate);
        //self.onChange(startDate, endDate);
        self.applyfilter(1, "datatable");
      }

      $('#js-daterangepicker-predefined1').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
          'Today': [moment(), moment()],
          'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
          'This week': [moment().startOf('week'), moment().endOf('week')],
          'Last 7 Days': [moment().subtract(6, 'days'), moment()],
          'Last 30 Days': [moment().subtract(29, 'days'), moment()],
          'This Month': [moment().startOf('month'), moment().endOf('month')],
          'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
      }, cb);

      cb(start, end);

      // function to filter the savings transactions per date
      function cb2(start: any, end: any) {
        $('#js-daterangepicker-predefined2 .js-daterangepicker-predefined2-preview').html(start.format('MMM D') + ' - ' + end.format('MMM D, YYYY'));
        const startDate = start.format('YYYY-MM-DD');
        const endDate = end.format('YYYY-MM-DD');
        //self.onChangeSav(startDate, endDate);
        self.applyfilter(2, "savingsDatatable");

      }

      $('#js-daterangepicker-predefined2').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
          'Today': [moment(), moment()],
          'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
          'This week': [moment().startOf('week'), moment().endOf('week')],
          'Last 7 Days': [moment().subtract(6, 'days'), moment()],
          'Last 30 Days': [moment().subtract(29, 'days'), moment()],
          'This Month': [moment().startOf('month'), moment().endOf('month')],
          'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
      }, cb2);

      cb2(start, end);


      //this is the place

      // function to filter the withdrawal transactions per date
      function cb3(start: any, end: any) {
        $('#js-daterangepicker-predefined3 .js-daterangepicker-predefined3-preview').html(start.format('MMM D') + ' - ' + end.format('MMM D, YYYY'));
        const startDate = start.format('YYYY-MM-DD');
        const endDate = end.format('YYYY-MM-DD');
        //self.onChangeWith(startDate, endDate);
        self.applyfilter(3, "withdrawalsDatatable");
      }

      $('#js-daterangepicker-predefined3').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
          'Today': [moment(), moment()],
          'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
          'This week': [moment().startOf('week'), moment().endOf('week')],
          'Last 7 Days': [moment().subtract(6, 'days'), moment()],
          'Last 30 Days': [moment().subtract(29, 'days'), moment()],
          'This Month': [moment().startOf('month'), moment().endOf('month')],
          'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
      }, cb3);

      cb3(start, end);

      // function to filter the commission transactions per date
      function cb4(start: any, end: any) {
        $('#js-daterangepicker-predefined4 .js-daterangepicker-predefined4-preview').html(start.format('MMM D') + ' - ' + end.format('MMM D, YYYY'));
        const startDate = start.format('YYYY-MM-DD');
        const endDate = end.format('YYYY-MM-DD');
        //self.onChangeComm(startDate, endDate);
        self.applyfilter(4, "commissionsDatatable");
      }

      $('#js-daterangepicker-predefined4').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
          'Today': [moment(), moment()],
          'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
          'This week': [moment().startOf('week'), moment().endOf('week')],
          'Last 7 Days': [moment().subtract(6, 'days'), moment()],
          'Last 30 Days': [moment().subtract(29, 'days'), moment()],
          'This Month': [moment().startOf('month'), moment().endOf('month')],
          'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
      }, cb4);

      cb4(start, end);


      //HSCore.components.HSFlatpickr.init('.js-flatpickr');

      HSCore.components.HSDaterangepicker.init('.js-daterangepicker-clear');

      $('.js-daterangepicker-clear').on('apply.daterangepicker', function (this: HTMLSelectElement, ev: any, picker: any) {
        var da = $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
        console.log(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
      })

      $('.js-daterangepicker-clear').on('cancel.daterangepicker', function (this: HTMLSelectElement, ev: any, picker: any) {
        $(this).val('')
      })
    });


  }

  applyfilter(id: number, tableName: string) {
    $('#js-daterangepicker-predefined' + id).on('apply.daterangepicker', function (ev: any, picker: any) {
      var start = picker.startDate;
      var end = picker.endDate;
      $.fn.dataTable.ext.search.push(
        function (settings: any, data: any, dataIndex: any) {
          var min = start;
          var max = end;
          var startDate = new Date(data[6]);

          if (min == null && max == null) {
            return true;
          }
          if (min == null && startDate <= max) {
            return true;
          }
          if (max == null && startDate >= min) {
            return true;
          }
          if (startDate <= max && startDate >= min) {
            return true;
          }
          return false;
        }
      );
      //var tableName= "savingsDatatable";
      $("#" + tableName).DataTable().draw();
      $.fn.dataTable.ext.search.pop();
    });
  }

  jsOnLoad() {
    (function () {
      window.onload = function () {


        // INITIALIZATION OF NAVBAR VERTICAL ASIDE
        // =======================================================
        new HSSideNav('.js-navbar-vertical-aside').init()


        // INITIALIZATION OF FORM SEARCH
        // =======================================================
        new HSFormSearch('.js-form-search')


        // INITIALIZATION OF BOOTSTRAP DROPDOWN
        // =======================================================
        HSBsDropdown.init()


        // INITIALIZATION OF SELECT
        // =======================================================
        HSCore.components.HSTomSelect.init('.js-select')


        // INITIALIZATION OF NAV SCROLLER
        // =======================================================
        new HsNavScroller('.js-nav-scroller')
      }
    })()
  }

}
