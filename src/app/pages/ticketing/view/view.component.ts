import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';

declare var $: any;

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
})
export class ViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(DataTableDirective, { static: false })
  //dtElements!: QueryList<DataTableDirective>;
  dtElement!: DataTableDirective;
  datatableElement: any = DataTableDirective;
  header = [
    'Image',
    'Title',
    'Merchant',
    'Event Date',
    'Qty sold',
    'Status',
    'Action',
  ];
  allTickets!: Array<any>;
  path =
    environment.app.baseUrl +
    environment.app.path +
    environment.app.allImagesPath;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();

  isDtInitialized: boolean = false;
  modalContent!: object | any;
  loading: boolean = false;
  dummyImage = 'https://placehold.co/600x400?text=No+Banner';
  avatar = environment.avatar;
  emptyTable = environment.emptyTable;
  public showComponent = false;

  constructor(
    private dataService: DataService,
    private toastService: ToastService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.tableConfig();
    this.getAllTickets();
    this.getMonthDate();
  }

  getAllTickets() {
    try {
      this.loading = true;
      this.dataService.getAllTickets().subscribe(
        (res: any) => {
          this.allTickets = res.data;
          // this.allTickets = res.filter((r:any)=>{
          //   return r.submerchantId !== '0';
          // });
          //this.dtTrigger.next('');
          if (this.isDtInitialized) {
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.destroy();
              this.dtTrigger.next('');
            });
          } else {
            this.isDtInitialized = true;
            this.dtTrigger.next('');
          }
          this.loading = false;
          this.showComponent = true;
        },
        (error: any) => {
          this.loading = false;
          this.toastService.showError('Error fetching all tickets', 'Error');
        }
      );
    } catch (error) {
      this.loading = false;
      this.toastService.showError(
        'Error loading tickets. Please check you internet',
        'Error'
      );
    }
  }

  download(name: string) {
    var table = '#' + 'datatable';
    $(table)
      .DataTable()
      .button('.buttons-' + name)
      .trigger();
  }

  ngAfterViewInit(): void {
    //this.dtTrigger.next('');
  }

  ngOnDestroy(): void {
    // We will unsubscribe the even
    this.dtTrigger.unsubscribe();
  }

  tableConfig() {
    const dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 15,
      processing: true,
      language: {
        zeroRecords: `<div class="text-center p-4">
            <img class="mb-3" src="${this.emptyTable}" alt="Image Description" style="width: 10rem;">
          <p class="mb-0">No data to show</p>
          </div>`,
        paginate: {
          next: '<span aria-hidden="true">Next</span>',
          previous: '<span aria-hidden="true">Prev</span>',
          first: '<i class="bi bi-skip-backward"></i>',
          last: '<i class="bi bi-skip-forward"></i>',
        },
      },
      lengthMenu: [10, 15, 20],
      select: true,
      dom: 'Brtip',
      columnDefs: [{ width: '5%', targets: 2 }],
      fixedColumns: {
        leftColumns: 2,
      },
      //  scrollY: 300,
      buttons: [
        {
          extend: 'copy',
          className: 'd-none',
        },
        {
          extend: 'print',
          className: 'd-none',
        },
        {
          extend: 'excel',
          className: 'd-none',
          filename: () => {
            return 'Moloyal_Tickets' + new Date().getTime();
          },
          exportOptions: {
            columns: [2, 3, 4, 5, 6],
          },
        },
        {
          extend: 'csv',
          className: 'd-none',
          filename: () => {
            return 'Moloyal_Tickets' + new Date().getTime();
          },
          exportOptions: {
            columns: [2, 3, 4, 5, 6],
          },
        },
        {
          extend: 'pdf',
          className: 'd-none',
          filename: () => {
            return 'Moloyal_Tickets' + new Date().getTime();
          },
          exportOptions: {
            columns: [2, 3, 4, 5, 6],
          },
        },
      ],
      info: true,
      lengthChange: true,
    };
    this.dtOptions[0] = dtOptions;
  }

  filter(event: any, tableName: string) {
    var value = event.target.value;
    if (value.length > 0) {
      $('#datatableSearch').on('keyup', () => {
        if (value === null) value = '';
        $('#' + tableName)
          .DataTable()
          .search(value)
          .draw();
      });
    }
  }

  showColumn(ev: any, id: number, tableName: string) {
    if (typeof ev.target.checked === 'boolean') {
      $('#' + tableName)
        .DataTable()
        .columns(id)
        .visible(ev.target.checked);
    }
  }

  openModal(content: any, tableRow: any) {
    this.modalContent = tableRow;
    this.modalService.open(content);
  }

  deleteEvent(id: number) {
    this.loading = true;
    const value = {
      eventid: id,
    };
    try {
      this.dataService.deleteEventTicket(value).subscribe(
        (res: any) => {
          this.loading = false;
          // if(res.error == false){
          if (res.error === id) {
            this.toastService.showSuccess(res.message, 'Success');
            this.modalService.dismissAll('Delete completed');
            this.getAllTickets();
          } else {
            this.toastService.showError(res.message, 'Error');
          }
        },
        (error: any) => {
          this.toastService.showError(error.message, 'Error');
        }
      );
    } catch (error) {
      this.loading = false;
      this.toastService.showError(
        'Could not delete event. Please check your internet and try again.',
        'Error'
      );
    }
  }

  getMonthDate() {
    const currentMonthDates = new Array(moment().daysInMonth())
      .fill(null)
      .map((x, i) => moment().startOf('month').add(i, 'days').format('MMM D'));
    const currentMonthDates2 = Array.from(
      { length: moment().daysInMonth() },
      (x, i) => moment().startOf('month').add(i, 'days').format('MMM D')
    );
    const last30days = new Array(moment().daysInMonth())
      .fill(null)
      .map((x, i) =>
        moment().subtract(29, 'days').add(i, 'days').format('MMM D')
      );
  }
}
