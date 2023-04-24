import { Component, OnDestroy, OnInit, QueryList, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'app-recipients',
  templateUrl: './recipients.component.html',
  styleUrls: ['./recipients.component.css']
})
export class RecipientsComponent implements OnInit, OnDestroy {

  @ViewChild(DataTableDirective)
  dtElements!: QueryList<DataTableDirective>;
  datatableElement: any = DataTableDirective;
  recipientRecords!: Array<any>;
  emptyTable = environment.emptyTable;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();
  imageBaseURL: string = environment.app.baseUrl+environment.app.imagePath;
  avatar = environment.avatar;  
  successRecords!: Array<any>;
  failedRecords!: Array<any>;
  totalSum!: number;
  lastWeekTransfer!: any;
  thisWeekTransfer!: any;
  thisMonthTransfer!: any;

  lastWeekTransferSum!: number;
  thisWeekTransferSum!: number;
  thisMonthTransferSum!: number;
  page = 'recipients';

  constructor(private dataService: DataService, private toastService: ToastService,
    private route: Router) {
    //this.jsInit();
    //this.jsInit2(); 
  }

  ngOnInit(): void {    
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
          className: 'd-none',
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5 ]
          }
        },
        {
          extend: 'print',
          className: 'd-none',
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5 ]
          },
          
        },
        {
          extend: 'excel',
          className: 'd-none',
          filename: ()=> {
            return 'MoSave_'+this.page+ '_report_' + new Date().getTime();
          },
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5 ]
          },
          // customize: function (pdf: any) { // or use customizeData
          //   this.addExtraColumn(pdf);
          // }
        },
        {
          extend: 'csv',
          className: 'd-none',
          filename: ()=> {
            return 'MoSave_'+this.page+ '_report_' + new Date().getTime();
          },
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5 ]
          }
        },
        {
          extend: 'pdf',
          className: 'd-none',
          filename: ()=> {
            return 'MoSave_'+this.page+ '_report_' + new Date().getTime();
          },
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5 ]
          }
        },
      ],
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

  getAllTransfers() {
    const config = {
      perPage: 1000+''
    }
    let params = decodeURIComponent(new URLSearchParams(config).toString());
    console.log(params);
    try {
      this.dataService.getTransferRecipients(params).subscribe((res: any) => {
        console.log(res);
        if(res?.status == true){
          this.recipientRecords = res.data;
          this.dtTrigger.next('');
        }else {
          this.toastService.showError(res?.message, 'Error');  
        }
       });
    } catch (error: any) {
      console.log(error);
      this.toastService.showError(error?.message, 'Error');
    }
     
  }

  viewRecord(id: string){
    if(id){
      this.route.navigate(['/transfers', btoa(id), 'details']);
    }
  }

  download(name: string) {
    var table = '#datatable';
    console.log(name);
    $(table).DataTable().button('.buttons-'+name).trigger();
  }

  filter(event: any, tableid: number, tableName: string,) {
    var value = event.target.value;
      if(value.length > 0){
        $("#datatableSearch" + tableid).on("keyup", ()=> {
          if (value === null) value = '';
          $("#" + tableName).DataTable().search(value).draw();
        });
      }
  }





}
