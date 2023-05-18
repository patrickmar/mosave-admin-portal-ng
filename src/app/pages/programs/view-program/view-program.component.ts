import { Component, OnDestroy, OnInit, QueryList, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'app-view-program',
  templateUrl: './view-program.component.html',
  styleUrls: ['./view-program.component.css']
})
export class ViewProgramComponent implements OnInit, OnDestroy {
  programType!: string | any;
  @ViewChild(DataTableDirective)
  dtElements!: QueryList<DataTableDirective>;
  datatableElement: any = DataTableDirective;
  records!: Array<any>;
  emptyTable = environment.emptyTable;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();
  tableHead!: { value: string; class: string; }[];

  constructor(private router: Router, private route: ActivatedRoute,
    private dataService: DataService, private toastService: ToastService,) { }

  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.getProgramType();
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
            columns: [0, 1, 2, 3, 4, 5]
          }
        },
        {
          extend: 'print',
          className: 'd-none',
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5]
          },

        },
        {
          extend: 'excel',
          className: 'd-none',
          filename: ()=> {
            return 'MoSave_'+this.programType+ '_report_' + new Date().getTime();
          },
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5]
          },
          // customize: function (pdf: any) { // or use customizeData
          //   this.addExtraColumn(pdf);
          // }
        },
        {
          extend: 'csv',
          className: 'd-none',
          filename: ()=> {
            return 'MoSave_'+this.programType+ '_report_' + new Date().getTime();
          },
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5]
          }
        },
        {
          extend: 'pdf',
          className: 'd-none',
          filename: ()=> {
            return 'MoSave_'+this.programType+ '_report_' + new Date().getTime();
          },
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5]
          }
        },
      ],
      info: true,
      lengthChange: true,
    };
    this.dtOptions[0] = dtOptions;
    this.getAllRecords();
  }

  ngOnDestroy(): void {
    // We will unsubscribe the even
    this.dtTrigger.unsubscribe();
  }

  getProgramType() {
    this.programType = this.route.snapshot.paramMap.get('type');
    return this.programType;
  }

  getAllRecords() {
    const api = this.getProgramType() === 'merchant' ? this.dataService.getAllMerchants() : this.dataService.getAllPrograms();
    const header1 = [
      {value: 'S/N', class: 'table-column-pe-2'},
      {value: 'Merchant ID', class: 'table-column-ps-0'},
      {value: 'Merchant Name', class: '' },
      {value: 'Program Email', class: ''},
      {value: 'Program Name', class: '' },
      {value: 'Program Id', class: '' },
      {value: 'Action', class: '' },
    ]
    const header2 = [
      {value: 'S/N', class: 'table-column-pe-2'},
      {value: 'Program ID', class: 'table-column-ps-0'},
      {value: 'Program Name', class: '' },
      {value: 'Program Email', class: ''},
      {value: 'Contact Name', class: '' },
      {value: 'Contact Phone Number', class: '' },
      {value: 'Action', class: '' },
    ]
    this.tableHead = this.getProgramType() === 'merchant' ? header1 : header2;
    try {
      api.subscribe((res: any) => {
        console.log(res)
        this.records = res;
        this.dtTrigger.next('');
      }, (error: any) => {
        this.toastService.showError(error?.message, 'Error');
      })
    } catch (error) {
      console.log(error);
      this.toastService.showError('Could not fetch all '+this.getProgramType(), 'Error');
    }
  }

  viewRecord(id: string) {
    if (id) {
      this.router.navigate(['/programs', 'update', btoa(id), this.getProgramType()]);
    }
  }

  download(name: string) {
    var table = '#datatable';
    console.log(name);
    $(table).DataTable().button('.buttons-' + name).trigger();
  }

  filter(event: any, tableid: number, tableName: string,) {
    var value = event.target.value;
    if (value.length > 0) {
      $("#datatableSearch" + tableid).on("keyup", ()=> {
        if (value === null) value = '';
        $("#" + tableName).DataTable().search(value).draw();
      });
    }
  }



}
