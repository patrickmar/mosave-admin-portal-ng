import { TitleCasePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';
import { DateAgoPipe } from '../../pipes/date-ago.pipe';

declare var $:any;
declare var moment:any;
declare var HSCore:any;
declare var HSSideNav:any;
declare var HSFormSearch:any;
declare var HSBsDropdown:any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dataTable:any;
  user: any;
  firstname!: string;
  customer!: Array<any>;
  customerExist: boolean = false;
  date: any;
  imagePath: string  = environment.app.baseUrl+environment.app.imagePath;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();

  @ViewChild(DataTableDirective, {static: false})
  datatableElement: any = DataTableDirective;
  

  constructor(private authservice: AuthService, 
    private dataService: DataService) { }

  ngOnInit(): void {
    this.getUserDetails();
    this.getAllCustomers();   
    //$('#datatable').DataTable();
    //this.jsOnLoad();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 15,
      processing: true,
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
      select: true,
      dom: 'Brtip',
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
        className: 'd-none',
      },
      {
        extend: 'print',
        className: 'd-none'
      },
      {
        extend: 'pdf',
        className: 'd-none'
      },
      ],      
      info: true,
      lengthChange: true,
    };
    this.download();
    this.jsInit();    
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  ngAfterViewInit(){
  }


  getUserDetails(){
    this.authservice.userData$.subscribe((response: any) => {
      console.log(response);
      this.user = response;
      var titleCasePipe = new TitleCasePipe();
      this.firstname = titleCasePipe.transform(this.user?.firstname);
      console.log(this.user.sn);
    });
  }

  getAllCustomers(){ 
    this.dataService.getAllcustomers().subscribe((data: any) =>{
      console.log(data);
      this.customer = data;
      // for (var i = 0; i < data.length; i++) {
      //   this.date = new DateAgoPipe().transform(data[i].date_registered);
      // console.log(this.date);
      // }
      this.dtTrigger.next('');
      if(this.customer?.length > 0 ){
        this.customerExist = true;
      }else {
        this.customerExist = false;
      }
    }),((error: any)=>{
      console.log(error);
    })
  }

  rerender(event: any){
    var value = event.target.value;
    // this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
            $("#datatableSearch").on("keyup", function () {
              if (value === 'null') value = '';
              // if (dtInstance.search() !== value) {
                // dtInstance.search(value).draw();
                $("#datatable").DataTable().search(value).draw();
              //}
            });
        // });    
  }

  download(){
    $('#export-excel').on('click', () => {
      $("#datatable").DataTable().button('.buttons-excel').trigger();
    });
    $('#export-print').on('click', () => {
      $("#datatable").DataTable().button('.buttons-print').trigger();
    });
    $('#export-csv').on('click', () => {
      $("#datatable").DataTable().button('.buttons-csv').trigger();
    });
    $('#export-pdf').on('click', () => {
      $("#datatable").DataTable().button('.buttons-pdf').trigger();
    });
    $('#export-copy').on('click', () => {
      $("#datatable").DataTable().button('.buttons-copy').trigger();
    });

    $('.js-datatable-filter').on('change', function(this: any) {
      var $this = $(this),        
        elVal = $this.val(),
        targetColumnIndex = $this.data('target-column-index');
      if (elVal === 'null') elVal = '';
      $("#datatable").DataTable().column(targetColumnIndex).search(elVal, true, false, false).draw(false);
    });

    document.querySelectorAll('.js-datatable-filter2').forEach(function (item) {
      item.addEventListener('change',function(e) {
        var elVal = (e.target as HTMLSelectElement).value,
    targetColumnIndex = (e.target as HTMLSelectElement).getAttribute('data-target-column-index'),
    targetTable = (e.target as HTMLSelectElement).getAttribute('data-target-table');
   if (elVal === 'null') elVal = '';
    $("#datatable").DataTable().getItem(targetTable).column(targetColumnIndex).search(elVal, true, false, false).draw(false);
      })
    }); 
  }


  
  jsInit(){
    (function() {
    
    window.onload = function () {

      new HSSideNav('.js-navbar-vertical-aside').init()
    // INITIALIZATION OF FORM SEARCH
      // =======================================================

      // INITIALIZATION OF BOOTSTRAP DROPDOWN
      // =======================================================
      HSBsDropdown.init()

      const HSFormSearchInstance = new HSFormSearch('.js-form-search');      

      if (HSFormSearchInstance.collection.length) {
        HSFormSearchInstance.getItem(1).on('close', function (el:any) {
          el.classList.remove('top-0')
        })

        document.querySelector('.js-form-search-mobile-toggle')?.addEventListener('click', (e:any) => {
          //const el = e.currentTarget as HTMLInputElement
          let dataOptions = JSON.parse(e.currentTarget?.getAttribute('data-hs-form-search-options')),
            $menu = document.querySelector(dataOptions.dropMenuElement);
          $menu.classList.add('top-0')
          $menu.style.left = 0
        })
      };

          // INITIALIZATION OF SELECT
      // =======================================================
      HSCore.components.HSTomSelect.init('.js-select')


      // INITIALIZATION OF CLIPBOARD
      // =======================================================
      HSCore.components.HSClipboard.init('.js-clipboard')


      
    // INITIALIZATION OF DATATABLES
    // =======================================================
    // HSCore.components.HSDatatables.init($('#datatable'), {
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
    //           <img class="mb-3" src="./assets/svg/illustrations/oc-error.svg" alt="Image Description" style="width: 10rem;" data-hs-theme-appearance="default">
    //           <img class="mb-3" src="./assets/svg/illustrations-light/oc-error.svg" alt="Image Description" style="width: 10rem;" data-hs-theme-appearance="dark">
    //         <p class="mb-0">No data to show</p>
    //         </div>`
    //   }
    // });

    // const datatable = HSCore.components.HSDatatables.getItem(0);
    // console.log(datatable);

    // document.querySelectorAll('.js-datatable-filter').forEach(function (item) {
    //   item.addEventListener('change',function(e) {
    //     const elVal = (e.target as HTMLSelectElement).value,
    // targetColumnIndex = (e.target as HTMLSelectElement) .getAttribute('data-target-column-index'),
    // targetTable = (e.target as HTMLSelectElement).getAttribute('data-target-table');

    // HSCore.components.HSDatatables.getItem(targetTable).column(targetColumnIndex).search(elVal !== 'null' ? elVal : '').draw()
    //   })
    // });    
    }
  })()
  }

  jsOnLoad() {
    $(document).on('ready', function () {
    });
  }

}
