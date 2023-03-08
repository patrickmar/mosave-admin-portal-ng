import { Component, OnInit } from '@angular/core';
declare var HSCore: any;
declare var HSSideNav: any;
declare var HSAddField: any;
declare var HSBsDropdown: any;
declare var HSQuantityCounter: any;
declare var HSCore: any;

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  tableHead = ["Name", "Price", "Disc. Price", "Quantity", "Action"];
  eventCategory = ["Festival", "Conference", "Seminar", "Executive Meeting", "Webinar", "Comedy", "Gala Night", "Musical show", "Trade Fair", "Others",]

  constructor() { }

  ngOnInit(): void {
    this.jsInit();
    this.jsInit2();

    
  }

  jsInit() {

    $(document).on('ready', function () {
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
        }
      });
    });

  }

  jsInit2(){
    (function() {
      window.onload = function () {
        

        // INITIALIZATION OF NAVBAR VERTICAL ASIDE
        // =======================================================
        new HSSideNav('.js-navbar-vertical-aside').init()


        // INITIALIZATION OF BOOTSTRAP DROPDOWN
        // =======================================================
        HSBsDropdown.init()


        // INITIALIZATION OF SELECT
        // =======================================================
        HSCore.components.HSTomSelect.init('.js-select')


        // INITIALIZATION OF ADD FIELD
        // =======================================================
        new HSAddField('.js-add-field2', {
          addedField: (field:any) => {
            HSCore.components.HSTomSelect.init(field.querySelector('.js-select-dynamic'));
            HSCore.components.HSFlatpickr.init('#eventDateRangeLabel3');
            const eventDateRange3 = HSCore.components.HSFlatpickr.getItem('eventDateRangeLabel3');
            
            HSCore.components.HSFlatpickr.init('#eventDateRangeLabel4');
            const eventDateRange4 = HSCore.components.HSFlatpickr.getItem('eventDateRangeLabel4');
          }
        })

        // INITIALIZATION OF ADD FIELD
        // =======================================================
        new HSAddField('.js-add-field', {
          addedField: (field:any) => {
            new HSQuantityCounter(field.querySelector('.js-quantity-counter-dynamic'))
          }
        })


        // INITIALIZATION OF  QUANTITY COUNTER
        // =======================================================

        new HSQuantityCounter('.js-quantity-counter-input')

        HSCore.components.HSFlatpickr.init('#eventDateRangeLabel');
        const eventDateRange = HSCore.components.HSFlatpickr.getItem('eventDateRangeLabel');
        
        HSCore.components.HSFlatpickr.init('#eventDateRangeLabel2');
        const eventDateRange2 = HSCore.components.HSFlatpickr.getItem('eventDateRangeLabel2');

        


        // INITIALIZATION OF DROPZONE
        // =======================================================
        HSCore.components.HSDropzone.init('.js-dropzone')


        // INITIALIZATION OF QUILLJS EDITOR
        // =======================================================
        HSCore.components.HSQuill.init('.js-quill')
      }
    })()
  }

}
