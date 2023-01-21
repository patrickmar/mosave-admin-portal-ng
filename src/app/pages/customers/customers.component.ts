import { Component, OnInit, ViewChild } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';
import {DataTableDirective} from 'angular-datatables';
import * as moment from 'moment';
declare var $:any;
declare var HSCore:any;
declare var HSSideNav:any;
declare var HSFormSearch:any;
declare var HSBsDropdown:any;
declare var HsNavScroller:any;
declare var HSCounter:any;
declare var HSTogglePassword:any;
declare var HSFileAttach:any;
// declare var moment: any;

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  customer: any;
  customerExist: boolean = false;
  baseURL: string = environment.app.baseUrl;
  imageBaseURL: string = this.baseURL+environment.app.imagePath;
  defaultImageURL: string = environment.mini_logo;
  user:any;
  activeCustomers!: string;
  inactiveCustomers!: number;
  newCustomers!: any;
  searchTerm!: string;
  //dtOptions: DataTables.Settings = {};
  // Must be declared as "any", not as "DataTables.Settings"
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();

  @ViewChild(DataTableDirective, {static: false})
  datatableElement: any = DataTableDirective;

  constructor(private dataService: DataService, private authservice: AuthService) {
    // this.jsInit();
    // this.jsOnload();
    // this.getUserDetails();
    // this.getAllCustomers();
   }

  ngOnInit(): void {
    
    this.jsOnload();
    this.getUserDetails();
    this.getAllCustomers();
    var time = new Date().getTime();
    this.tableConfig();    
    this.download();
    this.jsInit();
  }

  tableConfig(){
    var self = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 15,
      processing: true,
      //searching: false,
      language: {
        zeroRecords: `<div class="text-center p-4">
            <img class="mb-3" src="./assets/svg/illustrations/oc-error.svg" alt="Image Description" style="width: 10rem;" data-hs-theme-appearance="default">
            <img class="mb-3" src="./assets/svg/illustrations-light/oc-error.svg" alt="Image Description" style="width: 10rem;" data-hs-theme-appearance="dark">
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
          return 'MoSave_Customers'+new Date().getTime();
       }
      },
      {
        extend: 'csv',
        className: 'd-none',
        filename: function () {
          return 'MoSave_Customers'+new Date().getTime();
       }
      },      
      {
        extend: 'pdf',
        className: 'd-none',
        filename: function () {
          return 'MoSave_Customers'+new Date().getTime();
       }
      },
      ],      
      info: true,
      lengthChange: true,
      // select: {
      //     style: 'multi',
      //     selector: 'td:first-child input[type="checkbox"]',
      //     classMap: {
      //       checkAll: '#datatableCheckAll',
      //       counter: '#datatableCounter',
      //       counterInfo: '#datatableCounterInfo'
      //     }
      // },

    };
  }

  getUserDetails(){
    this.authservice.userData$.subscribe((response: any) => {
      console.log(response);
      this.user = response;
    });
  }
  ngOnDestroy(): void {
    // We will unsubscribe the even
    this.dtTrigger.unsubscribe();
    //$.fn['dataTable'].ext.search.pop();
  }

  getAllCustomers(){ 
    forkJoin([
      this.dataService.getAllcustomers(),
      this.dataService.getTotalActiveCustomers()
    ])
    .subscribe((data: any) =>{
      console.log(data);
      this.customer = data[0];
      this.activeCustomers = data[1];
      this.inactiveCustomers = Number(data[0].length) - Number(data[1]);
      console.log(this.inactiveCustomers);
      this.getNewCustomers();
      if(this.customer?.length > 0 ){
        this.customerExist = true;
      }else {
        this.customerExist = false;
      }
      this.dtTrigger.next('');
    }),((error: any)=>{
      console.log(error);
    })
  }

  getNewCustomers(){
    const startOfWeek = moment().startOf('week').format();
    const endOfWeek = moment().endOf('week').format();
    var newCustomers = this.customer.filter((m: any) => new Date(m.date_registered) >= new Date(startOfWeek) && new Date(m.date_registered) <= new Date(endOfWeek));
    console.log(newCustomers);
    this.newCustomers= newCustomers.length
    console.log(this.newCustomers);
  }

  filterTable(event: any){
      // Get the search value
  console.log(event.target.value);
  let userInput: string = event.target.value;
  if(userInput.length >= 2){
    this.searchTerm = userInput;
    console.log(this.searchTerm);
    this.filter();
  }
  }

  filter(){
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  generalFilter(){
  $.fn['dataTable'].ext.search.push((settings:any, data:any, dataIndex:any) => {
    //const id = parseFloat(data[0]) || 0; // use data for the id column
    // if ((isNaN(this.min) && isNaN(this.max)) || (isNaN(this.min) && id <= this.max) || (this.min <= id && isNaN(this.max)) || (this.min <= id && id <= this.max)) {
    //   return true;
    // }
  });
  }

  ngAfterViewInit(): void {
    //this.dtTrigger.next(this.customer);
  }
  download(){
    $('#export-excel').on('click', () => {
      //$('.buttons-excel').click();
      //$(".buttons-excel").trigger("click");
      $("#datatable").DataTable().button('.buttons-excel').trigger();
    });
    $('#export-print').on('click', () => {
      $('.buttons-print').click();
    });
    $('#export-csv').on('click', () => {
      $('.buttons-csv').click();
    });
    $('#export-pdf').on('click', () => {
      $('.buttons-pdf').click();
    });
    $('#export-copy').on('click', () => {
      $('.buttons-copy').click();
    });

    $('.js-datatable-filter').on('change', function(this: any) {
      var $this = $(this),        
        elVal = $this.val(),
        targetColumnIndex = $this.data('target-column-index');
      if (elVal === 'null') elVal = '';
      //$("#datatable").DataTable().column(targetColumnIndex).search(elVal).draw();
      //let's do a regex search;
      $("#datatable").DataTable().column(targetColumnIndex).search(elVal, true, false, false).draw(false);
    });
  }

  download1(){
    this.datatableElement.dtInstance.then((dtInstance: any) => {
      // $('#export-excel').click(function() {
      //   dtInstance.DataTable.button('.buttons-excel').trigger();
      //   // dtInstance.button('.buttons-excel').trigger();
      //   // if ($.fn.dataTable.ext.buttons.csvHtml5.available( dt, config )) {
      //   //   alert('Button activated');
      //   //     $.fn.dataTable.ext.buttons.csvHtml5.action(e, dt, button, config);
      //   // }
      //   // else {
      //   //   alert('Button not activated');
      //   //     $.fn.dataTable.ext.buttons.csvFlash.action(e, dt, button, config);
      //   // }
      // });

      $('#export-excel').on('click', function() {
        $('.buttons-excel').click()
      });
  });
  }

  rerender(event: any){
    const value = event.target.value;
    console.log(value);
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
            $(".input").on("keyup", function () {
              if (dtInstance.search() !== value) {
                dtInstance.search(value).draw();
              }
            });
        });
    
        // this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        //   dtInstance.columns().every(function () {
        //     const that = this;
        //     $(".input", this.footer()).on("keyup change", function (this:any) {
        //       if (that.search() !== this["value"]) {
        //         that.search(this["value"]).draw();
        //       }
        //     });
        //   });
        // });
    
  }

  convertNum(number: any){
    return Number(number);
  }


  jsInit(){
    var self = this;
    $(document).on('ready', function () {
      // INITIALIZATION OF DATATABLES
      // =======================================================
      // HSCore.components.HSDatatables.init($('.table'), {
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
      //         <img class="mb-3" src="./assets/svg/illustrations/oc-error.svg" alt="Image Description" style="width: 10rem;" data-hs-theme-appearance="default">
      //         <img class="mb-3" src="./assets/svg/illustrations-light/oc-error.svg" alt="Image Description" style="width: 10rem;" data-hs-theme-appearance="dark">
      //       <p class="mb-0">No data to show</p>
      //       </div>`
      //   }
      // })

      // const datatable = HSCore.components.HSDatatables.getItem(0);

      // $('#export-copy').click(function() {
      //   datatable.button('.buttons-copy').trigger()
      // });

      // $('#export-excel').click(function() {
      //   datatable.button('.buttons-excel').trigger()
      // });

      // $('#export-csv').click(function() {
      //   datatable.button('.buttons-csv').trigger()
      // });

      // $('#export-pdf').click(function() {
      //   datatable.button('.buttons-pdf').trigger()
      // });

      // $('#export-print').click(function() {
      //   datatable.button('.buttons-print').trigger()
      // });

      // $('.js-datatable-filter').on('change', function(this: any) {
      //   var $this = $(this),        
      //     elVal = $this.val(),
      //     targetColumnIndex = $this.data('target-column-index');
      //     console.log('reach here');
      //     console.log($(this));

      //   if (elVal === 'null') elVal = ''

      //   datatable.column(targetColumnIndex).search(elVal).draw();
      // });
      $("#datatable_filter").removeClass("dataTables_filter");

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
        $('#js-daterangepicker-predefined .js-daterangepicker-predefined-preview').html(start.format('MMM D') + ' - ' + end.format('MMM D, YYYY'));
        const startDate = start.format('YYYY-MM-DD');
        const endDate = end.format('YYYY-MM-DD');
        console.log(startDate);
        console.log(endDate);
        //self.onChange(startDate, endDate);
        self.applyfilter(1, "datatable");
      }

      $('#js-daterangepicker-predefined').daterangepicker({
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
    });
  }

  applyfilter(id: number, tableName: string) {
    $('#js-daterangepicker-predefined').on('apply.daterangepicker', function (ev: any, picker: any) {
      var start = picker.startDate;
      var end = picker.endDate;
      console.log('reach here');
      $.fn.dataTable.ext.search.push(
        function (settings: any, data: any, dataIndex: any) {
          var min = start;
          var max = end;
          var startDate = new Date(data[4]);

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

  jsOnload(){
    (function() {
      window.onload = function () {
        

        // INITIALIZATION OF NAVBAR VERTICAL ASIDE
        // =======================================================
        new HSSideNav('.js-navbar-vertical-aside').init()


        // INITIALIZATION OF FORM SEARCH
        // =======================================================
        new HSFormSearch('.js-form-search');


        // INITIALIZATION OF BOOTSTRAP DROPDOWN
        // =======================================================
        HSBsDropdown.init();


        // INITIALIZATION OF SELECT
        // =======================================================
         HSCore.components.HSTomSelect.init('.js-select');


        // INITIALIZATION OF INPUT MASK
        // =======================================================
        HSCore.components.HSMask.init('.js-input-mask');


        // INITIALIZATION OF NAV SCROLLER
        // =======================================================
        new HsNavScroller('.js-nav-scroller');


        // INITIALIZATION OF COUNTER
        // =======================================================
        new HSCounter('.js-counter');


        // INITIALIZATION OF TOGGLE PASSWORD
        // =======================================================
        new HSTogglePassword('.js-toggle-password');


        // INITIALIZATION OF FILE ATTACHMENT
        // =======================================================
        new HSFileAttach('.js-file-attach');
      }
    })()
  }

}
