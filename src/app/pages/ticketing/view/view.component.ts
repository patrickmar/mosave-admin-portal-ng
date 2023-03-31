import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';

declare var $: any;
declare var HSCore: any;
declare var HSCounter: any;
declare var HSBsDropdown: any;

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(DataTableDirective)
  dtElements!: QueryList<DataTableDirective>;
  datatableElement: any = DataTableDirective;
  
  header = ['Image', 'Title', 'Merchant', 'Event Date', 'Qty sold', 'Status', 'Action']
  allTickets!: Array<any>;
  path = environment.app.baseUrl+ environment.app.path+ environment.app.allImagesPath;

  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(private dataService: DataService, private toastService: ToastService) {

  }

  ngOnInit(): void {    
    this.tableConfig();
    this.getAllTickets();
  }

  getAllTickets(){
    try {
      this.dataService.getAllTickets().subscribe((res: any) => {
        console.log(res);
        this.allTickets = res.filter((r:any)=>{
          return r.submerchantId !== '0';
        });
        this.dtTrigger.next('');    
      }, (error: any)=> {
        this.toastService.showError(error.message, 'Error');
      });
      
    } catch (error) {
      this.toastService.showError('Error loading tickets. Please check you internet', 'Error');      
    }
  }

  download(name: string) {
    var table = "#" + 'datatable';
    $(table).DataTable().button('.buttons-' + name).trigger();
  }

  ngAfterViewInit(): void {
    //this.dtTrigger.next('');
  }

  ngOnDestroy(): void {
    // We will unsubscribe the even
    this.dtTrigger.unsubscribe();
  }

  tableConfig(){
    const dtOptions = {
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
      columnDefs: [
        { width: "5%", targets: 3 }
      ],
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
          return 'Moloyal_Tickets'+new Date().getTime();
       },
       exportOptions: {
        columns: [ 2, 3, 4, 5, 6 ]
      },
      },
      {
        extend: 'csv',
        className: 'd-none',
        filename: () => {
          return 'Moloyal_Tickets'+new Date().getTime();
       },
       exportOptions: {
        columns: [ 2, 3, 4, 5, 6 ]
      },
      },
      {
        extend: 'pdf',
        className: 'd-none',
        filename:  () => {
          return 'Moloyal_Tickets'+new Date().getTime();
       },
       exportOptions: {
        columns: [ 2, 3, 4, 5, 6 ]
      },
      }
      ],      
      info: true,
      lengthChange: true,
    };
    this.dtOptions[0] = dtOptions;
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
  }

  filter(event: any, tableid: number, tableName: string,) {
    var value = event.target.value;
      if(value.length > 0){
        $("#datatableSearch" + tableid).on("keyup", function () {
          if (value === null) value = '';
          $("#" + tableName).DataTable().search(value).draw();
        });
      }
  }

}
