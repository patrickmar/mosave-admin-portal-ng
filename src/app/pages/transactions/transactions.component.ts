import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, ElementRef, Input, NgZone, OnDestroy, OnInit, Output, QueryList, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbCalendar, NgbDate, NgbModal, NgbDatepickerModule, NgbDateStruct, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { forkJoin, Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ReceiptService } from 'src/app/services/receipt.service';
import { StatService } from 'src/app/services/stat.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
//import { moment} from 'moment';
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

  public loading = false;
  public showComponent = false;

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
    private receiptService: ReceiptService, private modalService: NgbModal,
    private cdr: ChangeDetectorRef, private ngZone: NgZone, private route: ActivatedRoute,
    private statService: StatService, calendar: NgbCalendar, private toastService: ToastService, private router: Router) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  }

  ngOnInit(): void {
    // this.jsInit();
    // this.jsOnLoad();
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.getTableHead();
    this.getTransactionType();
    //this.dtOptions
    var time = new Date().getTime();

    this.dateRanges = this.statService.getDateRanges();

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
          filename: () => {
            return 'MoSave_report_' + new Date().getTime();
          },
          exportOptions: {
            columns: [1, 2, 3, 4, 5, 6, 7]
          }
        },
        {
          extend: 'csv',
          className: 'd-none',
          filename: () => {
            return 'MoSave_report_' + new Date().getTime();
          },
          exportOptions: {
            columns: [1, 2, 3, 4, 5, 6, 7]
          }
        },
        {
          extend: 'pdf',
          className: 'd-none',
          filename: () => {
            return 'MoSave_report_' + new Date().getTime();
          },
          exportOptions: {
            columns: [1, 2, 3, 4, 5, 6, 7]
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
    $("#datatableSearch" + tableid).on("keyup", () => {
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
          $("#datatableSearch").on("keyup", () => {
            if (value === 'null') value = '';
            if (dtInstance.search() !== value) {
              dtInstance.search(value).draw();
            }
          });
        } else if (dtInstance.table().node().id == id) {
          $("#datatableSearch").on("keyup", () => {
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
      $("#datatableSearch").on("keyup", () => {
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
    try {
      this.loading = true;
    forkJoin([
      this.dataService.getMosaveTransactions(),
      this.dataService.getMosaveSavingTransactions()
    ]).subscribe((result: any) => {
      console.log(result[0]);
      console.log(result[1]);
      this.loading = false;
      this.showComponent = true;
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
      //let date = new Date();
      // let today = date.setDate(date.getDate() - 0);
      // let yesterday = date.setDate(date.getDate() - 1);
      // let lastweek = date.setDate(date.getDate() - 7);

      //const endDate4 = this.datePipe.transform(new Date().setDate(new Date().getDate()), 'YYYY-MM-dd');
      //console.log(endDate4);
      //console.log(date.getDate());
      //let d = new Date();
      //const today5 = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
      //console.log(today5);

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
      this.loading = false;
      this.toastService.showError('Error fetching transaction info', 'Error');
    }
  } catch (error) {
    this.loading = false;
    this.toastService.showError('Error fetching data. Please refresh this page', 'Error');     
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

  showColumn(ev: any, tableName: string) {
    if (typeof (ev.value.target.checked) === 'boolean') {
      $("#" + tableName).DataTable().columns(ev.id).visible(ev.value.target.checked)
    }
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

  // openModal(event:any) {
  //   const modalRef = this.modalService.open(NgbdModalContent);
  // 	modalRef.componentInstance.id = event.id;
  //   modalRef.componentInstance.onClick.subscribe(($e: any) => {
  //     console.log($e);
  //     //this.onSave();
  //   })
  // }

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


  jsOnLoad() {
    (function () {
      window.onload = function () {
        // INITIALIZATION OF NAVBAR VERTICAL ASIDE
        // =======================================================
        new HSSideNav('.js-navbar-vertical-aside').init()

        HSCore.components.HSDaterangepicker.init('.js-daterangepicker')


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
