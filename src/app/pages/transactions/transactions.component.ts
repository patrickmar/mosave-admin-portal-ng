import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ReceiptService } from 'src/app/services/receipt.service';
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
export class TransactionsComponent implements OnInit {
  records!: Array<any>;
  recordsExist: boolean = false;
  user: any;
  allRecords: any;
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

  thisMonth!: any;
  
  thisMonthCommission!: any;
  thisMonthSavings!: any;
  thisMonthWithdrawal!: any

  lastTwoMonths!: any;
  lastTwoMonthsData!: any;
  
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
  

  constructor(private dataService: DataService, private datePipe: DatePipe, 
    private receiptService: ReceiptService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.jsInit();
    this.jsOnLoad();
    this.getAllTrxs();
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
      
      const newSavingsRecords = result[1].map((res: any) => {
        if (res.transType == "S") {
          var type = res.transType + "avings";
        } else {
          var type = res.transType + "";
        }
        return { ...res, transType: type };
      })
      this.savingsRecords = newSavingsRecords;
      this.withdrawalRecords = this.allRecords.filter((item: any) => item.transType === 'Withdrawal');
      this.commissionRecords = this.allRecords.filter((item: any) => item.transType === "commission");

      //calculate the total savings
      this.savingsSum = this.savingsRecords.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
      console.log(this.savingsSum);

      //calculate the total withdrawals
      this.withdrawalSum = this.withdrawalRecords.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
      console.log(this.withdrawalSum);

      //calculate the total commissions
      this.commissionSum = this.commissionRecords.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
      console.log(this.commissionSum);

      let date = new Date();
      let today = date.setDate(date.getDate() - 0);
      let yesterday = date.setDate(date.getDate() - 1);
      let lastweek = date.setDate(date.getDate() - 7);
      let lastmonth = date.setDate(date.getDate() - 30);

      // let today = this.datePipe.transform(date.setDate(date.getDate() - 0), 'YYYY-M-d');
      // let yesterday = this.datePipe.transform(date.setDate(date.getDate() - 1), 'YYYY-M-d');
      // let lastweek = this.datePipe.transform(date.setDate(date.getDate() - 7), 'YYYY-M-dd');
      console.log(today);
      console.log(yesterday);
      console.log(lastweek);
      console.log(lastmonth);

      let todayTrnx = this.allRecords.filter((item: any) => new Date(item.transDate + " " + item.time) >= new Date(yesterday) && new Date(item.transDate + " " + item.time) <= new Date(today));
      console.log(todayTrnx);

      let lastweekTrnx = this.allRecords.filter((item: any) => new Date(item.transDate + " " + item.time) >= new Date(lastweek) && new Date(item.transDate + " " + item.time) <= new Date(today));
      console.log(lastweekTrnx);

      let lastMonthTrnx = this.allRecords.filter((item: any) => new Date(item.transDate + " " + item.time) >= new Date(lastmonth) && new Date(item.transDate + " " + item.time) <= new Date(today));
      console.log(lastMonthTrnx);


      const endDate4 = this.datePipe.transform(new Date().setDate(new Date().getDate()), 'YYYY-MM-dd');
      console.log(endDate4);
      console.log(date.getDate());
      let d = new Date();
      const today5 = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " "+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
      console.log(today5);
      const yesterday5 = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate() - 1) + " "+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
      console.log(yesterday5);
      const lastweek5 = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate() - 7) + " "+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
      console.log(lastweek5);
      const month5 = d.getFullYear() + "-" + (d.getMonth()) + "-" + (d.getDate()) + " "+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
      console.log(month5);
      var lastweek6 = new Date(lastweek5)
      var today6 = new Date(today5);
      var month6 = new Date(month5);
      console.log(lastweek6);
      console.log(today6);
      console.log(month6);

      console.log(new Date().getMonth());

      let today3 = this.allRecords.filter((m: any) => new Date(m.transDate + " " + m.time) >= new Date(today5) && new Date(m.transDate + " " + m.time) <= new Date(today5));
      console.log(today3);

      let lastweek3 = this.allRecords.filter((m: any) => new Date(m.transDate) >= new Date(lastweek5) && new Date(m.transDate) <= new Date(today5));
      console.log(lastweek3);

      let month3 = this.allRecords.filter((m: any) => new Date(m.transDate) >= new Date(month5) && new Date(m.transDate) <= new Date(today5));
      console.log(month3);

      var monthData = this.allRecords.filter((x: any) => new Date(x.transDate).getMonth()+ 1 == new Date().getMonth()+ 1);
      console.log(monthData);

      
      this.thisDay = (d.getDate()).toString().padStart(2, "0");
      console.log(this.thisDay);
      this.thisMonth = (d.getMonth() + 1).toString().padStart(2, "0");
      this.lastTwoMonths  = (d.getMonth() + 0).toString().padStart(2, "0");

      this.thisMonthSavings = this.savingsRecords.filter((x: any) =>  new Date(x.transDate).getMonth() + 1  == this.thisMonth);
      console.log(this.thisMonthSavings);

      this.thisMonthWithdrawal = this.withdrawalRecords.filter((x: any) =>  new Date(x.transDate).getMonth() + 1  == this.thisMonth);
      console.log(this.thisMonthWithdrawal);

      this.thisMonthCommission = this.commissionRecords.filter((x: any) =>  new Date(x.transDate).getMonth() + 1  == this.thisMonth);
      console.log(this.thisMonthCommission);

      
      this.lastTwoMonthsData = this.allRecords.filter((x: any) =>  new Date(x.transDate).getMonth() + 1  == this.lastTwoMonths);
      console.log(this.lastTwoMonthsData);


       //calculate the total savings per month
       this.savingsSumMonthly = this.thisMonthSavings.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
       console.log(this.savingsSumMonthly);
 
       //calculate the total withdrawals per month
       this.withdrawalSumMonthly = this.thisMonthWithdrawal.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
       console.log(this.withdrawalSumMonthly);
 
       //calculate the total commissions per month
       this.commissionSumMonthly = this.thisMonthCommission.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
       console.log(this.commissionSumMonthly);


       //Filter Today's transactions for savings, withdrawal and commission
       console.log(new Date().getDate());

       this.thisDaySavings = this.savingsRecords.filter((x: any) =>  new Date(x.transDate).getDate() == this.thisDay);
      console.log(this.thisDaySavings);

      this.thisDayWithdrawals = this.withdrawalRecords.filter((x: any) =>  new Date(x.transDate).getDate() == this.thisDay);
      console.log(this.thisDayWithdrawals);

      this.thisDayCommissions = this.commissionRecords.filter((x: any) =>  new Date(x.transDate).getDate()  == this.thisDay);
      console.log(this.thisDayCommissions);


      //calculate the total savings per day
      this.savingsSumDaily = this.thisDaySavings.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
      console.log(this.savingsSumDaily);

      //calculate the total withdrawals per day
      this.withdrawalSumDaily = this.thisDayWithdrawals.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
      console.log(this.withdrawalSumDaily);

      //calculate the total commissions per day
      this.commissionSumDaily = this.thisDayCommissions.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
      console.log(this.commissionSumDaily);


      const week = this.datePipe.transform(new Date().setDate(new Date().getDate()), 'ww');
      console.log(week);

      this.thisWeekSavings = this.savingsRecords.filter((x: any) =>  this.datePipe.transform(new Date().setDate(new Date(x.transDate).getDate()), 'ww') == week);
      console.log(this.thisWeekSavings);

      this.thisWeekWithdrawals = this.withdrawalRecords.filter((x: any) =>  this.datePipe.transform(new Date().setDate(new Date(x.transDate).getDate()), 'ww') == week);
      console.log(this.thisWeekWithdrawals);

      this.thisWeekCommissions = this.commissionRecords.filter((x: any) =>  this.datePipe.transform(new Date().setDate(new Date(x.transDate).getDate()), 'ww') == week);
      console.log(this.thisWeekCommissions);

       //calculate the total savings per week
       this.savingsSumWeekly = this.thisWeekSavings.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
       console.log(this.savingsSumWeekly);

       //calculate the total withdrawal per week
       this.withdrawalSumWeekly = this.thisWeekWithdrawals.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
       console.log(this.withdrawalSumWeekly);
       
       //calculate the total commissions per week
       this.commissionSumWeekly = this.thisWeekCommissions.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
       console.log(this.commissionSumWeekly);


    }), (error: any) => {
      console.log(error);
    }

  }

  getFirstDay(d:any) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  setFirstDay( date:any ) {
    var day = date.getDay() || 7;  
    if( day !== 1 ) 
        date.setHours(-24 * (day - 1)); 
    return date;
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


  jsInit() {
    $(document).on('ready', function () {
      // INITIALIZATION OF DATATABLES
      // =======================================================
      HSCore.components.HSDatatables.init($('#datatable'), {
        dom: 'Bfrtip',
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
            className: 'd-none'
          },
          {
            extend: 'pdf',
            className: 'd-none'
          },
          {
            extend: 'print',
            className: 'd-none'
          },
        ],
        select: {
          style: 'multi',
          selector: 'td:first-child input[type="checkbox"]',
          classMap: {
            checkAll: '#datatableCheckAll',
            counter: '#datatableCounter',
            counterInfo: '#datatableCounterInfo'
          }
        },
        language: {
          zeroRecords: `<div class="text-center p-4">
              <img class="mb-3" src="./assets/svg/illustrations/oc-error.svg" alt="Image Description" style="width: 10rem;" data-hs-theme-appearance="default">
              <img class="mb-3" src="./assets/svg/illustrations-light/oc-error.svg" alt="Image Description" style="width: 10rem;" data-hs-theme-appearance="dark">
            <p class="mb-0">No data to show</p>
            </div>`
        }
      });

      const datatable = HSCore.components.HSDatatables.getItem('datatable')

      $('.js-datatable-filter').on('change', function (this: HTMLSelectElement) {
        var $this = $(this),
          elVal = $this.val(),
          targetColumnIndex = $this.data('target-column-index');

        datatable.column(targetColumnIndex).search(elVal).draw();
      });

      $('#datatableSearch').on('mouseup', function (this: HTMLInputElement) {
        var $input = $(this),
          oldValue = $input.val();

        if (oldValue == "") return;

        setTimeout(function () {
          var newValue = $input.val();

          if (newValue == "") {
            // Gotcha
            datatable.search('').draw();
          }
        }, 1);
      });

      $('#toggleColumn_ref').change(function (e: any) { 
        datatable.columns(1).visible(e.target.checked)
      })

      $('#toggleColumn_customer').change(function (e: any) {
        datatable.columns(2).visible(e.target.checked)
      })

      $('#toggleColumn_amount').change(function (e: any) {
        datatable.columns(3).visible(e.target.checked)
      })

      $('#toggleColumn_plan').change(function (e: any) {
        datatable.columns(4).visible(e.target.checked)
      })

      $('#toggleColumn_transaction_type').change(function (e: any) {
        datatable.columns(5).visible(e.target.checked)
      })

      $('#toggleColumn_date').change(function (e: any) {
        datatable.columns(6).visible(e.target.checked)
      })

      datatable.columns(7).visible(false)

      $('#toggleColumn_phone_no').change(function (e: any) {
        datatable.columns(7).visible(e.target.checked)
      })

      $('#toggleColumn_actions').change(function (e: any) {
        datatable.columns(8).visible(e.target.checked)
      })
    });

    // INITIALIZATION OF DATERANGEPICKER
      // =======================================================
      $('.js-daterangepicker').daterangepicker();

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

      function cb(start:any, end:any) {
        $('#js-daterangepicker-predefined .js-daterangepicker-predefined-preview').html(start.format('MMM D') + ' - ' + end.format('MMM D, YYYY'));
      }

      $('#js-daterangepicker-predefined').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
          'Today': [moment(), moment()],
          'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
          'Last 7 Days': [moment().subtract(6, 'days'), moment()],
          'Last 30 Days': [moment().subtract(29, 'days'), moment()],
          'This Month': [moment().startOf('month'), moment().endOf('month')],
          'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
      }, cb);

      cb(start, end);

    HSCore.components.HSFlatpickr.init('.js-flatpickr');

    HSCore.components.HSDaterangepicker.init('.js-daterangepicker-clear');

      $('.js-daterangepicker-clear').on('apply.daterangepicker', function(this: HTMLSelectElement, ev:any, picker:any) {
        $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
      })

      $('.js-daterangepicker-clear').on('cancel.daterangepicker', function(this: HTMLSelectElement, ev:any, picker:any) {
        $(this).val('')
      })

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
