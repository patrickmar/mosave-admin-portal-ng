import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, ElementRef, NgZone, OnDestroy, OnInit, QueryList, ViewChild, ChangeDetectionStrategy, AfterViewChecked, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbCalendar, NgbDate, NgbModal, NgbDatepickerModule, NgbDateStruct, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import * as moment from 'moment';
import { forkJoin, Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ReceiptService } from 'src/app/services/receipt.service';
import { StatService } from 'src/app/services/stat.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
declare var $: any;
declare var HSCore: any;
declare var HSSideNav: any;
declare var HSFormSearch: any;
declare var HSBsDropdown: any;
declare var HsNavScroller: any;

@Component({
  selector: 'app-transactions',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {

  @ViewChildren(DataTableDirective) dtElements!: QueryList<DataTableDirective>;
  //@ViewChild(DataTableDirective) dtElement!: DataTableDirective; // new
  dtOptions: DataTables.Settings | any = {};
  //dtOptions: DataTables.Settings[] = [];
  //dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dtTrigger2: Subject<any> = new Subject<any>();
  dtTrigger3: Subject<any> = new Subject<any>();
  dtTrigger4: Subject<any> = new Subject<any>();
  isDtInitialized: boolean = false

  public loading = false;
  public showComponent = false;
  time = new Date();

  transactionType!: any;
  records!: Array<any>;
  recordsExist: boolean = false;
  user: any;
  allRecords!: Array<any>;
  trnxRecords: any;
  savingsRecords!: Array<any>;
  withdrawalRecords!: Array<any>;
  commissionRecords!: Array<any>;
  customerId!: number;
  modalContent!: object | any;
  modalContent2!: object | any;

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
  maxCount: number = 5000;

  bestSavers!: Array<any>;
  emptyTable = environment.emptyTable;
  table = ['datatable', 'savingsDatatable', 'withdrawalsDatatable', 'commissionsDatatable']
  //ranges = [moment().format('MMM D'), moment().format('MMM D, YYYY')]
  ranges = [moment(this.statService.lanchDate).startOf('day').format('MMM D, YYYY'), moment().endOf('day').format('MMM D, YYYY')]
  dateRanges!: Array<any>;
  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate;
  toDate: NgbDate | null = null;

  constructor(private dataService: DataService, private datePipe: DatePipe,
    private receiptService: ReceiptService, private modalService: NgbModal, private ref: ChangeDetectorRef,
    private ngZone: NgZone, private route: ActivatedRoute,
    private statService: StatService, calendar: NgbCalendar, private toastService: ToastService, private router: Router) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  }

  ngOnInit(): void {
    this.jsOnLoad();
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.getTableHead();
    this.getTransactionType();
    var time = new Date().getTime();
    this.dateRanges = this.statService.getDateRanges();
    this.getOptions();
    this.getAllTrxs(this.maxCount);
  }

  ngAfterViewChecked() {
    if (this.maxCount == 30) {
      console.log(Math.random());
    }
  }

  ngAfterViewInit(): void {
    // this.dtTrigger.next('');
    // this.dtTrigger2.next('');
    // this.dtTrigger3.next('');
    // this.dtTrigger4.next('');
  }

  ngOnDestroy(): void {
    // We will unsubscribe the table
    this.dtTrigger.unsubscribe();
    this.dtTrigger2.unsubscribe();
    this.dtTrigger3.unsubscribe();
    this.dtTrigger4.unsubscribe();

  }

  getTransactionType() {
    this.transactionType = this.route.snapshot.paramMap.get('type');
  }


  filter(event: any, tableid: number, tableName: string,) {
    var value = event.target.value;
    $("#datatableSearch" + tableid).on("keyup", () => {
      if (value === 'null') value = '';
      $("#" + tableName).DataTable().search(value).draw();
    });
  }

  // ngOnChanges() {
  //   this.ref.detectChanges();
  // }

  downloadAll(tableName: string, name: string) {
    const table = "#" + tableName;
    $(table).DataTable().button('.buttons-' + name).trigger();
  }

  getAllTrxs(maxcount: number) {
    try {
      this.loading = true;
      forkJoin([
        this.dataService.getMosaveTransactions(),
        this.dataService.getMosaveSavingTransactions()
      ]).subscribe((result: any) => {
        console.log(result[0]);
        console.log(result[1]);
        this.fetchTrnx(result, maxcount);  
        this.ref.detectChanges();
        // this.isDtInitialized = true
        // this.dtTrigger.next('');
        this.rerender();
        
        console.log(this.bestSavers);
        console.log('After best savers');
      }), (error: any) => {
        console.log(error);
        this.loading = false;
        this.toastService.showError('Error fetching transaction info', 'Error');
      }
    } catch (error) {
      this.loading = false;
      this.toastService.showError('Error fetching data. Please refresh this page', 'Error');
    }
  }

  getTrxs(maxcount: number) {
    try {
      this.loading = true;
      forkJoin([
        this.dataService.getMosaveTransactions(),
        this.dataService.getMosaveSavingTransactions()
      ]).subscribe((result: any) => {
        this.fetchTrnx(result, maxcount);
        console.log(this.allRecords)
        this.rerender();      
      }), (error: any) => {
        console.log(error);
        this.loading = false;
        this.toastService.showError('Error fetching transaction info', 'Error');
      }
    } catch (error) {
      this.loading = false;
      this.toastService.showError('Error fetching data. Please refresh this page', 'Error');
    }
  }

  fetchTrnx(result: Array<any>, maxcount: number){
    this.loading = false;
        this.showComponent = true;
        const newRecords: Array<any> = result[0].map((res: any) => {
          if (res.transType == "S") {
            var type = res.transType + "avings";
          } else if (res.transType == "W") {
            var type = res.transType + "ithdrawal";
          } else {
            var type = res.transType + "";
          }
          return { ...res, transType: type };
        })
        console.log(this.maxCount);
        console.log(maxcount);
        this.allRecords = newRecords //.slice(0, this.maxCount);
        console.log('show all records');
        console.log(this.allRecords)
        this.trnxRecords = newRecords;

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

        this.getDailyTransactions();
        this.getMonthlyTransactions();
        this.getWeeklyTransactions();

        this.calculateAllTransactions();
        this.calculateDailyTransactions();
        this.calculateMonthlyTransactions();
        this.calculateWeeklyTransactions();
        this.bestSavers = this.statService.getBestStat(this.savingsRecords, this.savingsSum);
  }

  calculateAllTransactions() {
    //calculate the total savings
    this.savingsSum = this.savingsRecords.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    //calculate the total withdrawals
    this.withdrawalSum = this.withdrawalRecords.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    //calculate the total commissions
    this.commissionSum = this.commissionRecords.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
  }

  getDailyTransactions() {
    //Filter Today's transactions for savings, withdrawal and commission
    const day = this.datePipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd');
    this.thisDaySavings = this.savingsRecords.filter((x: any) => x.transDate == day);
    this.thisDayWithdrawals = this.withdrawalRecords.filter((x: any) => x.transDate == day);
    this.thisDayCommissions = this.commissionRecords.filter((x: any) => x.transDate == day);
  }

  getMonthlyTransactions() {
    const startOfMonth = moment().startOf('month').format();
    const endOfMonth = moment().endOf('month').format();
    this.thisMonthSavings = this.savingsRecords.filter((m: any) => new Date(m.transDate + " " + m.time) >= new Date(startOfMonth) && new Date(m.transDate + " " + m.time) <= new Date(endOfMonth));
    this.thisMonthWithdrawal = this.withdrawalRecords.filter((m: any) => new Date(m.transDate + " " + m.time) >= new Date(startOfMonth) && new Date(m.transDate + " " + m.time) <= new Date(endOfMonth));
    this.thisMonthCommission = this.commissionRecords.filter((m: any) => new Date(m.transDate + " " + m.time) >= new Date(startOfMonth) && new Date(m.transDate + " " + m.time) <= new Date(endOfMonth));
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
    //calculate the total withdrawals per day
    this.withdrawalSumDaily = this.thisDayWithdrawals.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    //calculate the total commissions per day
    this.commissionSumDaily = this.thisDayCommissions.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
  }


  calculateMonthlyTransactions() {
    //calculate the total savings per month
    this.savingsSumMonthly = this.thisMonthSavings.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    //calculate the total withdrawals per month
    this.withdrawalSumMonthly = this.thisMonthWithdrawal.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    //calculate the total commissions per month
    this.commissionSumMonthly = this.thisMonthCommission.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
  }

  calculateWeeklyTransactions() {
    //calculate the total savings per week
    this.savingsSumWeekly = this.thisWeekSavings.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    //calculate the total withdrawal per week
    this.withdrawalSumWeekly = this.thisWeekWithdrawals.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    //calculate the total commissions per week
    this.commissionSumWeekly = this.thisWeekCommissions.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
  }

  printReceipt(customerTrxs: any) {
    this.receiptService.printPdf(customerTrxs, this.user);
  }

  openReceipt(customerTrxs: any) {
    this.receiptService.openPdf(customerTrxs, this.user);
  }

  open(content: any, tableRow: any) {
    this.modalContent = tableRow;
    this.modalService.open(content);
  }

  showColumn(ev: any, tableName: string) {
    if (typeof (ev.value.target.checked) === 'boolean') {
      $("#" + tableName).DataTable().columns(ev.id).visible(ev.value.target.checked)
    }
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

  filterDataByDate(ev: any, content: any) {
    if (ev.timeline === 'Custom Range') {
      this.modalContent2 = ev;
      this.modalService.open(content);
    } else {
      const format = ev.timeline === 'All' ? 'MMM D, YYYY' : 'MMM D';
      $('#js-daterangepicker-predefined' + ev.id + ' .js-daterangepicker-preview-' + ev.id).html(ev.start.format(format) + ' - ' + ev.end.format('MMM D, YYYY'));
      this.applyfilter(ev);
    }
  }

  applyfilter(event: any) {
    $.fn.dataTable.ext.search.push((settings: any, data: any, dataIndex: any) => {
      const min = event.start;
      const max = event.end;
      const startDate = new Date(data[6]);
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
    });
    $("#" + event.tableName).DataTable().draw();
    $.fn.dataTable.ext.search.pop();
  }

  onSave() {
    const from = this.fromDate;
    const to = this.toDate;
    const fromDate = from.year + '-' + from.month + '-' + from.day;
    const toDate = to?.year + '-' + to?.month + '-' + to?.day;
    const format = from.year === to?.year ? 'MMM D' : 'MMM D, YYYY';
    const ev = {
      start: moment(fromDate).startOf('day'),
      end: moment(toDate).endOf('day'),
      timeline: this.modalContent2.timeline,
      id: this.modalContent2.id,
      tableName: this.modalContent2.tableName
    }
    $('#js-daterangepicker-predefined' + ev.id + ' .js-daterangepicker-preview-' + ev.id).html(ev.start.format(format) + ' - ' + ev.end.format('MMM D, YYYY'));
    this.applyfilter(ev);
    this.modalService.dismissAll('save changes');
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

  // Clear Cache
  clearCache() {
    //this.allRecords = [];
    this.allRecords.length = 0;
  }

  setCount(number: number, tableId: number) {
    console.log(number);
    if (number > 5000) {
      this.toastService.showError('Your input should not be more than 5000', 'Error')
    } else {
      this.clearCache();
      this.maxCount = number;      
      this.getTrxs(this.maxCount);
      // setInterval(() => {
      //console.log("changes detected");
      //this.ref.detectChanges();
      // }, 5000);
      //this.rerender(tableId);
    }
  }

  rerender(tableId?: number) {
    console.log(this.dtElements);
    if (this.isDtInitialized) {
      this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          // Destroy the table  first
          dtInstance.destroy();
          // Call the dtTrigger to rerender again
          console.log('reach dtTrigger next ' + index);
          this.dtTrigger.next('');
          this.dtTrigger2.next('');
          this.dtTrigger3.next('');
          this.dtTrigger4.next('');
        });
      });
    } else {
      this.isDtInitialized = true      
        this.dtTrigger.next('');
        this.dtTrigger2.next('');
        this.dtTrigger3.next('');
        this.dtTrigger4.next('');      
    }
    // if (this.isDtInitialized) {
    //   console.log('reach dtElement dtInstance')
    //     this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //       console.log('reach dtInstance destroy')
    //       dtInstance.destroy();
    //       this.dtTrigger.next('');
    //     });
    // } else {
    //   this.isDtInitialized = true
    //   this.dtTrigger.next('');
    // }
  }

  getOptions(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      //ordering: true,
      pageLength: 20,
      processing: true,
      info: true,
      //lengthChange: true,
      lengthMenu: [10, 15, 20],
      dom: 'Brtip',
      //destroy:true,
      language: {
        zeroRecords: `<div class="text-center p-4">
            <img class="mb-3" src="${this.emptyTable}" alt="Image Description" style="width: 10rem;">
          <p class="mb-0">No data to show</p>
          </div>`
      },
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
          filename: 'MoSave_report_' + new Date().getTime(),
          exportOptions: {
            columns: [1, 2, 3, 4, 5, 6, 7]
          }
        },
        {
          extend: 'csv',
          className: 'd-none',
          filename: 'MoSave_report_' + new Date().getTime(),
          exportOptions: {
            columns: [1, 2, 3, 4, 5, 6, 7]
          }
        },
        {
          extend: 'pdf',
          className: 'd-none',
          filename:'MoSave_report_' + new Date().getTime(),
          exportOptions: {
            columns: [1, 2, 3, 4, 5, 6, 7]
          },
          orientation: 'landscape'
        },
      ]
    };
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

  // onChange(startDate: any, endDate: any) {
  //   if (this.trnxRecords != null || this.trnxRecords != undefined) {
  //     this.ngZone.run(() => {
  //       this.allRecords = this.trnxRecords.filter((m: any) => new Date(m.transDate) >= new Date(startDate) && new Date(m.transDate) <= new Date(endDate));
  //       console.log(this.allRecords);
  //     });
  //   }

  // }

  // onChangeSav(startDate: any, endDate: any) {
  //   if (this.savingsTrnxRecords != null || this.savingsTrnxRecords != undefined) {
  //     this.ngZone.run(() => {
  //       this.savingsRecords = this.savingsTrnxRecords.filter((m: any) => new Date(m.transDate) >= new Date(startDate) && new Date(m.transDate) <= new Date(endDate));
  //       console.log(this.savingsRecords);
  //     });
  //     var tableName = "savingsDatatable";
  //     // $("#"+tableName).DataTable().search(this.savingsRecords).draw();
  //   }
  // }

  // onChangeWith(startDate: any, endDate: any) {
  //   if (this.withTrnxRecords != null || this.withTrnxRecords != undefined) {
  //     this.ngZone.run(() => {
  //       this.withdrawalRecords = this.withTrnxRecords.filter((m: any) => new Date(m.transDate) >= new Date(startDate) && new Date(m.transDate) <= new Date(endDate));
  //       console.log(this.withdrawalRecords);
  //     });
  //     this.dtTrigers.next('');
  //   }
  // }

  // onChangeComm(startDate: any, endDate: any) {
  //   if (this.commTrnxRecords != null || this.commTrnxRecords != undefined) {
  //     this.ngZone.run(() => {
  //       this.commissionRecords = this.commTrnxRecords.filter((m: any) => new Date(m.transDate) >= new Date(startDate) && new Date(m.transDate) <= new Date(endDate));
  //       console.log(this.commissionRecords);
  //     });
  //     this.dtTriger.next('');
  //   }
  // }

  
  // filter2(event: any, id: number) {
  //   var value = event.target.value;
  //   this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
  //     dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
  //       console.log(`The DataTable ${id} instance ID is: ${dtInstance.table().node().id}`);
  //       if (dtInstance.table().node().id == id) {
  //         $("#datatableSearch").on("keyup", () => {
  //           if (value === 'null') value = '';
  //           if (dtInstance.search() !== value) {
  //             dtInstance.search(value).draw();
  //           }
  //         });
  //       } else if (dtInstance.table().node().id == id) {
  //         $("#datatableSearch").on("keyup", () => {
  //           if (value === 'null') value = '';
  //           if (dtInstance.search() !== value) {
  //             dtInstance.search(value).draw();
  //           }
  //         });
  //       }

  //     });
  //   });
  // }

  // rerenderForATable(event: any) {
  //   var value = event.target.value;
  //   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
  //     $("#datatableSearch").on("keyup", () => {
  //       if (value === 'null') value = '';
  //       if (dtInstance.search() !== value) {
  //         dtInstance.search(value).draw();
  //         //$("#datatable").DataTable().search(value).draw();
  //       }
  //     });
  //   });
  // }

  
  // displayToConsole(): void {
  //   this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
  //     dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
  //       console.log(`The DataTable ${index} instance ID is: ${dtInstance.table().node().id}`);
  //     });
  //   });
  // }

}
