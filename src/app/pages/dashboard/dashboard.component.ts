import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  user: any;
  firstname!: string;
  customer!: Array<any>;
  customerExist: boolean = false;
  imagePath: string  = environment.app.baseUrl+environment.app.imagePath;

  constructor(private authservice: AuthService, 
    private dataService: DataService) { }

  ngOnInit(): void {
    this.getUserDetails();
    this.getAllCustomers();


    $(document).on('ready', function () {
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
    });


    // INITIALIZATION OF DATATABLES
    // =======================================================
    HSCore.components.HSDatatables.init($('#datatable'), {
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

    const datatable = HSCore.components.HSDatatables.getItem(0);
    console.log(datatable);

    document.querySelectorAll('.js-datatable-filter').forEach(function (item) {
      item.addEventListener('change',function(e) {
        const elVal = (e.target as HTMLSelectElement).value,
    targetColumnIndex = (e.target as HTMLSelectElement) .getAttribute('data-target-column-index'),
    targetTable = (e.target as HTMLSelectElement).getAttribute('data-target-table');

    HSCore.components.HSDatatables.getItem(targetTable).column(targetColumnIndex).search(elVal !== 'null' ? elVal : '').draw()
      })
    })






    window.onload = function () {

      // INITIALIZATION OF BOOTSTRAP DROPDOWN
      // =======================================================
      HSBsDropdown.init()


      // INITIALIZATION OF CHARTJS
      // =======================================================
      // Chart.plugins.unregister(ChartDataLabels);
      // HSCore.components.HSChartJS.init('.js-chart')


      // INITIALIZATION OF CHARTJS
      // =======================================================
      HSCore.components.HSChartJS.init('#updatingBarChart')
      const updatingBarChart = HSCore.components.HSChartJS.getItem('updatingBarChart')

      // Call when tab is clicked
      // document.querySelectorAll('[data-bs-toggle="chart-bar"]').forEach(item => {
      //   item.addEventListener('click', e => {
      //     let keyDataset = e.currentTarget.getAttribute('data-datasets')

      //     const styles = HSCore.components.HSChartJS.getTheme('updatingBarChart', HSThemeAppearance.getAppearance())

      //     if (keyDataset === 'lastWeek') {
      //       updatingBarChart.data.labels = ["Apr 22", "Apr 23", "Apr 24", "Apr 25", "Apr 26", "Apr 27", "Apr 28", "Apr 29", "Apr 30", "Apr 31"];
      //       updatingBarChart.data.datasets = [
      //         {
      //           "data": [120, 250, 300, 200, 300, 290, 350, 100, 125, 320],
      //           "backgroundColor": styles.data.datasets[0].backgroundColor,
      //           "hoverBackgroundColor": styles.data.datasets[0].hoverBackgroundColor,
      //           "borderColor": styles.data.datasets[0].borderColor
      //         },
      //         {
      //           "data": [250, 130, 322, 144, 129, 300, 260, 120, 260, 245, 110],
      //           "backgroundColor": styles.data.datasets[1].backgroundColor,
      //           "borderColor": styles.data.datasets[1].borderColor
      //         }
      //       ];
      //       updatingBarChart.update();
      //     } else {
      //       updatingBarChart.data.labels = ["May 1", "May 2", "May 3", "May 4", "May 5", "May 6", "May 7", "May 8", "May 9", "May 10"];
      //       updatingBarChart.data.datasets = [
      //         {
      //           "data": [200, 300, 290, 350, 150, 350, 300, 100, 125, 220],
      //           "backgroundColor": styles.data.datasets[0].backgroundColor,
      //           "hoverBackgroundColor": styles.data.datasets[0].hoverBackgroundColor,
      //           "borderColor": styles.data.datasets[0].borderColor
      //         },
      //         {
      //           "data": [150, 230, 382, 204, 169, 290, 300, 100, 300, 225, 120],
      //           "backgroundColor": styles.data.datasets[1].backgroundColor,
      //           "borderColor": styles.data.datasets[1].borderColor
      //         }
      //       ]
      //       updatingBarChart.update();
      //     }
      //   })
      // })


      // INITIALIZATION OF CHARTJS
      // =======================================================
      // HSCore.components.HSChartJS.init('.js-chart-datalabels', {
      //   plugins: [ChartDataLabels],
      //   options: {
      //     plugins: {
      //       datalabels: {
      //         anchor: function (context) {
      //           var value = context.dataset.data[context.dataIndex];
      //           return value.r < 20 ? 'end' : 'center';
      //         },
      //         align: function (context) {
      //           var value = context.dataset.data[context.dataIndex];
      //           return value.r < 20 ? 'end' : 'center';
      //         },
      //         color: function (context) {
      //           var value = context.dataset.data[context.dataIndex];
      //           return value.r < 20 ? context.dataset.backgroundColor : context.dataset.color;
      //         },
      //         font: function (context) {
      //           var value = context.dataset.data[context.dataIndex],
      //             fontSize = 25;

      //           if (value.r > 50) {
      //             fontSize = 35;
      //           }

      //           if (value.r > 70) {
      //             fontSize = 55;
      //           }

      //           return {
      //             weight: 'lighter',
      //             size: fontSize
      //           };
      //         },
      //         offset: 2,
      //         padding: 0
      //       }
      //     }
      //   }
      // })

      // INITIALIZATION OF SELECT
      // =======================================================
      HSCore.components.HSTomSelect.init('.js-select')


      // INITIALIZATION OF CLIPBOARD
      // =======================================================
      HSCore.components.HSClipboard.init('.js-clipboard')
    }




this.jsInit2();



  }

  jsInit2(){
    window.onload = function () {

      new HSSideNav('.js-navbar-vertical-aside').init()
    // INITIALIZATION OF FORM SEARCH
      // =======================================================
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
      }
    }
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
      if(this.customer?.length > 0 ){
        this.customerExist = true;
      }else {
        this.customerExist = false;
      }
    }),((error: any)=>{
      console.log(error);
    })
  }

}
