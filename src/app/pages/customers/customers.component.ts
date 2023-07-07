import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';
import { DataTableDirective } from 'angular-datatables';
import * as moment from 'moment';
import { StatService } from 'src/app/services/stat.service';
import { NgbCalendar, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
declare var $: any;
declare var HSCore: any;
declare var HSBsDropdown: any;

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit, OnDestroy {
  customer: any;
  customerExist: boolean = false;
  baseURL: string = environment.app.baseUrl;
  imageBaseURL: string = this.baseURL + environment.app.imagePath;
  defaultImageURL: string = environment.mini_logo;
  user: any;
  activeCustomers!: string;
  inactiveCustomers!: number;
  newCustomers!: number;
  searchTerm!: string;
  //dtOptions: DataTables.Settings = {};
  // Must be declared as "any", not as "DataTables.Settings"
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();
  avatar = environment.avatar;
  emptyTable = environment.emptyTable;
  public loading = false;
  public showComponent = false;
  ranges = [moment(this.statService.lanchDate).startOf('day').format('MMM D, YYYY'), moment().endOf('day').format('MMM D, YYYY')]
  dateRanges!: Array<any>;
  fromDate: NgbDate;
  toDate: NgbDate | null = null;
  modalContent!: object | any;
  hoveredDate: NgbDate | null = null;
  count = 200;
  duration = 5000;

  @ViewChild(DataTableDirective, { static: false })
  datatableElement: any = DataTableDirective;
  downloadOptions = [{
    name: 'copy', src: './assets/svg/illustrations/copy-icon.svg'
  }, {
    name: 'print', src: './assets/svg/illustrations/print-icon.svg'
  }, {
    name: 'excel', src: './assets/svg/brands/excel-icon.svg'
  }, {
    name: 'csv', src: './assets/svg/components/placeholder-csv-format.svg'
  }, {
    name: 'pdf', src: './assets/svg/brands/pdf-icon.svg'
  }]

  constructor(private dataService: DataService, private authservice: AuthService, private statService: StatService,
    public calendar: NgbCalendar, private modalService: NgbModal) {
    // this.jsOnload();
    // this.getUserDetails();
    // this.getAllCustomers();
    this.fromDate = calendar.getPrev(calendar.getToday(), 'd', 7);
    this.toDate = calendar.getToday();
  }

  ngOnInit(): void {

    this.jsOnload();
    this.dateRanges = this.statService.getDateRanges();
    this.getUserDetails();
    this.getAllCustomers();
    var time = new Date().getTime();
    this.tableConfig();
  }

  tableConfig() {
    var self = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 15,
      processing: true,
      //searching: false,
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
            return 'MoSave_Customers_' + new Date().getTime();
          },
          exportOptions: {
            columns: [1, 2, 3, 4, 5, 6, 7]
          }
        },
        {
          extend: 'csv',
          className: 'd-none',
          filename: function () {
            return 'MoSave_Customers_' + new Date().getTime();
          },
          exportOptions: {
            columns: [1, 2, 3, 4, 5, 6, 7]
          }
        },
        {
          extend: 'pdf',
          className: 'd-none',
          filename: function () {
            return 'MoSave_Customers_' + new Date().getTime();
          },
          exportOptions: {
            columns: [1, 2, 3, 4, 5, 6, 7]
          }
        },
      ],
      info: true,
      lengthChange: true,
    };
  }

  getUserDetails() {
    this.authservice.userData$.subscribe((response: any) => {
      this.user = response;
    });
  }
  ngOnDestroy(): void {
    // We will unsubscribe the table
    this.dtTrigger.unsubscribe();
  }

  getAllCustomers() {
    try {
      this.loading = true;
      forkJoin([
        this.dataService.getAllcustomers(),
        this.dataService.getTotalActiveCustomers()
      ])
        .subscribe((data: any) => {
          const newRecords = data[0].map((res: any) => {
            const allPlans = res?.plans?.map((p: any) => p.plan_name).join(', ');
            return { ...res, allPlans: allPlans };
          });
          this.customer = newRecords;
          this.activeCustomers = data[1];
          this.inactiveCustomers = Number(data[0].length) - Number(data[1]);
          this.loading = false;
          this.showComponent = true;
          this.getNewCustomers();
          if (this.customer?.length > 0) {
            this.customerExist = true;
          } else {
            this.customerExist = false;
          }
          this.dtTrigger.next('');
        }), ((error: any) => {
          console.log(error);
          this.loading = false;
        })
    } catch (error) {
      this.loading = false;
    }
  }

  parseInt(value: string){
    return parseInt(value);
  }
  getNewCustomers() {
    const startOfWeek = moment().startOf('week').format();
    const endOfWeek = moment().endOf('week').format();
    var newCustomers = this.customer.filter((m: any) => new Date(m.date_registered) >= new Date(startOfWeek) && new Date(m.date_registered) <= new Date(endOfWeek));
    this.newCustomers = newCustomers.length;
  }

  filterTable(event: any) {
    // Get the search value
    console.log(event.target.value);
    let userInput: string = event.target.value;
    if (userInput.length >= 2) {
      this.searchTerm = userInput;
      this.filter();
    }
  }

  filter() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();      
    });
  }

  ngAfterViewInit(): void {
    //this.dtTrigger.next(this.customer);
  }

  export(name: string) {
    var table = "#" + 'datatable';
    $(table).DataTable().button('.buttons-' + name).trigger();
  }

  rerender(event: any) {
    const value = event.target.value;
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      $(".input").on("keyup", function () {
        if (dtInstance.search() !== value) {
          dtInstance.search(value).draw();
        }
      });
    });
  }

  convertNum(number: any) {
    return Number(number);
  }

  filterDataByDate(start: any, end: any, timeline?: string, content?: any) {
    const ev = {
      start: moment(start).startOf('day'),
      end: moment(end).endOf('day'),
      timeline: timeline,
      id: 1,
      tableName: 'datatable'
    }
    if (timeline === 'Custom Range') {
      this.modalContent = ev;
      this.modalService.open(content);
    } else {
      const format = timeline === 'All' ? 'MMM D, YYYY' : 'MMM D';
      $('#daterangepicker-predefined .daterangepicker-preview').html(start.format(format) + ' - ' + end.format(format));
      this.dateFilter(ev);
    }
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
      start: moment(fromDate).startOf('day'),
      end: moment(toDate).endOf('day'),
      tableName: this.modalContent.tableName
    }
    $('#daterangepicker-predefined .daterangepicker-preview').html(ev.start.format(format) + ' - ' + ev.end.format(format));
    this.dateFilter(ev);
    this.modalService.dismissAll('save changes');
  }

  applyFilter(value: string, value2: string) {
    if (value === 'Any' || value === '') value = '';
    if (value2 === 'Any' || value2 === '') value2 = '';
    this.hideDropdown();
    $("#datatable").DataTable().search(value && value2, true, true, false).draw();
  }

  resetFilter(){
    $('.acctType').val('Any');
    $('.gender').val('Any');
    $("#datatable").DataTable().search('', true, false, false).draw();
  }

  hideDropdown(){
    $(".userdropdown").removeClass('show')
    $(".dropdown-toggle").removeClass('show')
  }

  dateFilter(event: any) {
    $.fn.dataTable.ext.search.push((settings: any, data: any, dataIndex: any) => {
      const min = event.start;
      const max = event.end;
      const startDate = new Date(data[4]);
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

  jsOnload() {
    (function () {
      window.onload = function () {
        
        // INITIALIZATION OF BOOTSTRAP DROPDOWN
        // =======================================================
        HSBsDropdown.init();

        // INITIALIZATION OF SELECT
        // =======================================================
        HSCore.components.HSTomSelect.init('.js-select');

      }
    })()
  }

}
