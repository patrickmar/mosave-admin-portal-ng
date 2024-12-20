import { Component, OnDestroy, OnInit, QueryList, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';

declare var $: any;
declare var HSCore: any;
declare var HSCounter: any;
declare var HSBsDropdown: any;

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.css']
})
export class ListingComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableDirective)
  dtElements!: QueryList<DataTableDirective>;
  datatableElement: any = DataTableDirective;
  transferRecords!: Array<any>;
  emptyTable = environment.emptyTable;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();
  imageBaseURL: string = environment.app.baseUrl+environment.app.imagePath;
  avatar = environment.avatar;  
  duration = 20000;
  successRecords!: Array<any>;
  failedRecords!: Array<any>;
  totalSum!: number;
  lastWeekTransfer!: any;
  thisWeekTransfer!: any;
  thisMonthTransfer!: any;

  lastWeekTransferSum!: number;
  thisWeekTransferSum!: number;
  thisMonthTransferSum!: number;

  public loading = false;
  public showComponent = false;
  totalFailedSum: any;
  lastWeekFailedTransfer!: any;
  thisWeekFailedTransfer!: any;
  thisMonthFailedTransfer!: any;
  thisWeekFailedTransferSum!: number;
  lastWeekFailedTransferSum!: number;
  thisMonthFailedTransferSum!: number;

  constructor(private dataService: DataService, private toastService: ToastService,
    private route: Router) {
    this.jsInit2(); 
  }

  ngOnInit(): void {    
    const dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 20,
      processing: true,
      language: {
        zeroRecords: `<div class="text-center p-4">
            <img class="mb-3" src="${this.emptyTable}" alt="Image Description" style="width: 10rem;">
          <p class="mb-0">No data to show</p>
          </div>`,
      },
      lengthMenu: [10, 15, 20],
      // select: true,
      dom: 'Brtip',
      buttons: [
        {
          extend: 'copy',
          className: 'd-none',
          exportOptions: {
            columns: [ 0, 2, 3, 4, 5 ]
          }
        },
        {
          extend: 'print',
          className: 'd-none',
          exportOptions: {
            columns: [ 0, 2, 3, 4, 5 ]
          },
          
        },
        {
          extend: 'excel',
          className: 'd-none',
          filename: ()=> {
            return 'MoSave_paystack_report_' + new Date().getTime();
          },
          exportOptions: {
            columns: [ 0, 2, 3, 4, 5 ]
          },
          // customize: function (pdf: any) { // or use customizeData
          //   this.addExtraColumn(pdf);
          // }
        },
        {
          extend: 'csv',
          className: 'd-none',
          filename: ()=> {
            return 'MoSave_paystack_report_' + new Date().getTime();
          },
          exportOptions: {
            columns: [ 0, 2, 3, 4, 5 ]
          }
        },
        {
          extend: 'pdf',
          className: 'd-none',
          filename: ()=> {
            return 'MoSave_paystack_report_' + new Date().getTime();
          },
          exportOptions: {
            columns: [ 0, 2, 3, 4, 5 ]
          }
        },
      ],
      // columnDefs: [
      //   {
      //       targets: [ 5 ],
      //       visible: false,
      //       searchable: false
      //   },
      // ],
      info: true,
      lengthChange: true,
    };
    this.dtOptions[0] = dtOptions;
    this.getAllTransfers();
  }

  ngOnDestroy(): void {
    // We will unsubscribe the even
    this.dtTrigger.unsubscribe();
  }

  //  addExtraColumn(pdf: any) {
  //   pdf.content[1].table.body.forEach((row: any, idx: any)=> { 
  //     let newCell = structuredClone(row[0]);
  //     newCell.text = idx === 0 ? "New Heading" : "";
  //     row.push( newCell );
  //     console.log( row );
  //   })
  // };

  getAllTransfers() {
    const config = {
      perPage: 1000+''
    }
    let params = decodeURIComponent(new URLSearchParams(config).toString());
    try {
      this.loading = true;
      this.dataService.getAllTransfers(params).subscribe((res: any) => {
        this.loading = false;
      this.showComponent = true;
        if(res?.status == true){
          this.transferRecords = res.data;
          this.successRecords = res.data.filter((item: any) => item.status === 'success');
          this.failedRecords = res.data.filter((item: any) => item.status === 'error' || item.status === 'fail');
            //calculate the total successful transfers
            this.totalSum = this.successRecords.reduce((sum: any, current: any) => sum + Number(current.amount), 0);
            //calculate the total failed transfers
            this.totalFailedSum = this.failedRecords.reduce((sum: any, current: any) => sum + Number(current.amount), 0);
            this.getAllTimeTransfers();
          this.dtTrigger.next('');
        }else {
          this.toastService.showError(res?.message, 'Error');  
        }
       }, (error: any)=>{        
        this.loading = false;
        this.toastService.showError('Error fetching data', 'Error');
       });
    } catch (error: any) {
      console.log(error);
      this.loading = false;
      this.toastService.showError(error?.message, 'Error');
    }
     
  }

  getAllTimeTransfers() {
    const startOfWeek = moment().startOf('week').format();
    const endOfWeek = moment().endOf('week').format();
    const startOfLastWeek = moment().subtract(1, 'week').startOf('week').format();
    const endOfLastWeek = moment().subtract(1, 'week').endOf('week').format();
    const startOfMonth = moment().startOf('month').format();
    const endOfMonth = moment().endOf('month').format();
    this.lastWeekTransfer = this.successRecords.filter((m: any) => new Date(m.transferred_at) >= new Date(startOfLastWeek) && new Date(m.transferred_at) <= new Date(endOfLastWeek));
    this.thisWeekTransfer = this.successRecords.filter((m: any) => new Date(m.transferred_at) >= new Date(startOfWeek) && new Date(m.transferred_at) <= new Date(endOfWeek));
    this.thisMonthTransfer = this.successRecords.filter((m: any) => new Date(m.transferred_at) >= new Date(startOfMonth) && new Date(m.transferred_at) <= new Date(endOfMonth));

    this.lastWeekFailedTransfer = this.failedRecords.filter((m: any) => new Date(m.transferred_at) >= new Date(startOfLastWeek) && new Date(m.transferred_at) <= new Date(endOfLastWeek));
    this.thisWeekFailedTransfer = this.failedRecords.filter((m: any) => new Date(m.transferred_at) >= new Date(startOfWeek) && new Date(m.transferred_at) <= new Date(endOfWeek));
    this.thisMonthFailedTransfer = this.failedRecords.filter((m: any) => new Date(m.transferred_at) >= new Date(startOfMonth) && new Date(m.transferred_at) <= new Date(endOfMonth));
    this.getSumOfTransfers();
    this.getSumOfFailedTransfers();
  }

  getSumOfTransfers() {
      //calculate the sum of transfer per time.
      this.lastWeekTransferSum = this.lastWeekTransfer.reduce((sum: any, current: any) => sum + Number(current.amount), 0);
      this.thisWeekTransferSum = this.thisWeekTransfer.reduce((sum: any, current: any) => sum + Number(current.amount), 0);
      this.thisMonthTransferSum = this.thisMonthTransfer.reduce((sum: any, current: any) => sum + Number(current.amount), 0);
    }

    getSumOfFailedTransfers() {
      //calculate the sum of transfer per time.
      this.lastWeekFailedTransferSum = this.lastWeekFailedTransfer.reduce((sum: any, current: any) => sum + Number(current.amount), 0);
      this.thisWeekFailedTransferSum = this.thisWeekFailedTransfer.reduce((sum: any, current: any) => sum + Number(current.amount), 0);
      this.thisMonthFailedTransferSum = this.thisMonthFailedTransfer.reduce((sum: any, current: any) => sum + Number(current.amount), 0);
    }

    viewRecord(id: string){
      if(id){
        this.route.navigate(['/transfers', btoa(id), 'details']);
      }
    }

  download(name: string) {
    var table = '#datatable';
    $(table).DataTable().button('.buttons-'+name).trigger();
  }

  filter(event: any, tableid: number, tableName: string) {
    var value = event.target.value;
      if(value.length > 0){
        $("#datatableSearch" + tableid).on("keyup", ()=> {
          if (value === null) value = '';
          $("#" + tableName).DataTable().search(value).draw();
        });
      }
  }

  

  jsInit2(){
    window.onload = function () {

      // INITIALIZATION OF BOOTSTRAP DROPDOWN
      // =======================================================
      HSBsDropdown.init()


      // INITIALIZATION OF SELECT
      // =======================================================
      HSCore.components.HSTomSelect.init('.js-select')


      // INITIALIZATION OF CLIPBOARD
      // ================================================
      HSCore.components.HSClipboard.init('.js-clipboard')
    }
  
  }

}
