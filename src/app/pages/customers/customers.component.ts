import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';
declare var $:any;
declare var HSCore:any;
declare var HSSideNav:any;
declare var HSFormSearch:any;
declare var HSBsDropdown:any;
declare var HsNavScroller:any;
declare var HSCounter:any;
declare var HSTogglePassword:any;
declare var HSFileAttach:any;

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

  constructor(private dataService: DataService, private authservice: AuthService) {
    this.getUserDetails();
    this.getAllCustomers();
    this.jsInit();
    this.jsOnload();
   }

  ngOnInit(): void {
    
    
  }

  getUserDetails(){
    this.authservice.userData$.subscribe((response: any) => {
      console.log(response);
      this.user = response;
    });
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
      if(this.customer?.length > 0 ){
        this.customerExist = true;
      }else {
        this.customerExist = false;
      }
    }),((error: any)=>{
      console.log(error);
    })
  }


  jsInit(){
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
      })

      const datatable = HSCore.components.HSDatatables.getItem(0)

      $('#export-copy').click(function() {
        datatable.button('.buttons-copy').trigger()
      });

      $('#export-excel').click(function() {
        datatable.button('.buttons-excel').trigger()
      });

      $('#export-csv').click(function() {
        datatable.button('.buttons-csv').trigger()
      });

      $('#export-pdf').click(function() {
        datatable.button('.buttons-pdf').trigger()
      });

      $('#export-print').click(function() {
        datatable.button('.buttons-print').trigger()
      });

      $('.js-datatable-filter').on('change', function(this: HTMLSelectElement) {
        var $this = $(this),        
          elVal = $this.val(),
          targetColumnIndex = $this.data('target-column-index');
          console.log('reach here');
          console.log($(this));

        if (elVal === 'null') elVal = ''

        datatable.column(targetColumnIndex).search(elVal).draw();
      });
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
