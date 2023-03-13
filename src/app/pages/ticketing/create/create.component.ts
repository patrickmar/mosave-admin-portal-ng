import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  eventTypes = ["Festival", "Conference", "Seminar", "Executive Meeting", "Webinar", "Comedy", "Gala Night", "Musical show", "Trade Fair", "Others",]
  ticketForm: FormGroup;
  showEndDate: boolean = false;
  maxQty = 10000;
  showSeat: boolean = false;

  constructor(private fb: FormBuilder) { 
    this.ticketForm = this.fb.group({  
      eventTitle: ['', [Validators.required, Validators.minLength(5)]],  
      venue: ['', [Validators.required, Validators.minLength(5)]], 
      //merchantName: ['', [Validators.required, Validators.minLength(5)]],
      submerchantId: new FormControl(parseInt(''), Validators.required),
      paystackAcctId: ['', [Validators.required, Validators.minLength(5)]],
      vendor: ['', [Validators.minLength(2)]],
      chargesBearer: ['', [Validators.required, Validators.minLength(2)]],
      eventType: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(2)]],
      tags: ['', [Validators.minLength(5)]],
      SeatCapacity: new FormControl(0),
      enableEvent: new FormControl(false),
      enableSeat: new FormControl(false),
      ticketCategories: this.fb.array([this.newCategory()]),
      start: this.fb.array([]),
      end: this.fb.array([]),
    });  
  }

  validations = {
    eventTitle: [
      { type: 'required', message: 'Title is required.' }
    ],
    name: [
      { type: 'required', message: 'Name is required.' }
    ],
    price: [
      { type: 'required', message: 'Price is required.' }
    ],
    qty: [
      { type: 'required', message: 'Qty is required.' }
    ],    
    phone: [
      { type: 'required', message: 'Phone Number is required.' },
      { type: 'invalidCountryPhone', message: 'Phone number is incorrect for the selected country.' },
      { type: 'minlength', message: 'Phone number  must be at least 11 characters long.' },
      { type: 'maxlength', message: 'Phone number cannot be more than 11 characters long.' },
    ],
    venue: [
      { type: 'required', message: 'Venue is required.' }
    ],
    description: [
      { type: 'required', message: 'Description is required.' }
    ],
    chargesBearer: [
      { type: 'required', message: 'Bearer is required.' }
    ],
    eventType: [
      { type: 'required', message: 'Event type is required.' }
    ],
    submerchantId: [
      { type: 'required', message: 'submerchantId is required.' }
    ],
    paystackAcctId: [
      { type: 'required', message: 'paystack Account is required.' }
    ],

  };

  ngOnInit(): void {
    this.jsInit();
    this.jsInit2();
    // this.addTicket();
    this.addStartDate();
    this.addEndDate();
  }

  displayEndDate(){
    if(this.showEndDate == false){
      this.showEndDate = true;
    } else {
      this.showEndDate = false;
    }
  }

  displaySeat(){
    if(this.showSeat == false){
      this.showSeat = true;
    } else {
      this.showSeat = false;
    }
  }


  ticketCategories() : FormArray {  
    return this.ticketForm.get("ticketCategories") as FormArray
  }  

  startDate() : FormArray {  
    return this.ticketForm.get("start") as FormArray
  } 

  endDate() : FormArray {  
    return this.ticketForm.get("end") as FormArray
  } 
     
  newCategory(): FormGroup {  
    return this.fb.group({ 
      name: this.fb.control('', Validators.required),
      price: this.fb.control('', Validators.compose([
        Validators.maxLength(10),
        Validators.minLength(2),
        Validators.min(10),
        Validators.required
      ])),
      qty: this.fb.control(10, Validators.compose([
        Validators.maxLength(6),
        Validators.minLength(1),
        Validators.min(1),
        Validators.max(this.maxQty)
      ])),
      discountPrice: this.fb.control('', Validators.compose([
        Validators.maxLength(10),
        Validators.minLength(2),
        Validators.min(10)
      ])),
    })  
  }

  newDate(): FormGroup{
    return this.fb.group({ date: '', time: '' })
  }
  
     
  addTicket() {  
    this.ticketCategories().push(this.newCategory());
  }

  addStartDate(){
    this.startDate().push(this.newDate());
  }

  addEndDate(){
    this.endDate().push(this.newDate());
  }

     
  removeTicket(i:number) {  
    this.ticketCategories().removeAt(i);  
  }
     
  removeEndDate(i:number) {  
    this.endDate().removeAt(i);
  }

  

  handleMinus(e: any, index: number) {
    let value = this.ticketForm.get("ticketCategories")?.value[index]?.qty;
    if (value === 1) {
      e.preventDefault();
    } else {
      const newValue = value - 1;
      this.ticketCategories().at(index).get('qty')?.setValue(newValue);
    }
  }
  handlePlus(e: any, index: number) {
    let value = this.ticketForm.get("ticketCategories")?.value[index]?.qty;
    if (value === this.maxQty) {
      e.preventDefault();
    } else {
      const newValue = value + 1;
      this.ticketCategories().at(index).get('qty')?.setValue(newValue);
    }
  }
     
  onSubmit() {
    var val = $("#quillArea .ql-editor").html();
    this.ticketForm.get('description')?.setValue(val);  
    console.log(this.ticketForm.value);
    this.ticketForm.reset();
  }  

  merchantList = [
    {
      id: 1,
      name: 'BME',
      merchantId: 201501
    },
    {
      id: 2,
      name: 'Dangote',
      merchantId: 201502
    },
    {
      id: 3,
      name: 'Fair acres',
      merchantId: 201503
    },
    {
      id: 4,
      name: 'Muson',
      merchantId: 201504
    },
    {
      id: 5,
      name: 'Flytime',
      merchantId: 201505
    },
  ]

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

        // INITIALIZATION OF  QUANTITY COUNTER
        // =======================================================

        //new HSQuantityCounter('.js-quantity-counter-input');

        // INITIALIZATION OF  DATE PICKER
        // =======================================================

        HSCore.components.HSFlatpickr.init('#eventDateRangeLabel');        
        HSCore.components.HSFlatpickr.init('#eventDateRangeLabel2');
        HSCore.components.HSFlatpickr.init('#eventDateRangeLabel3');
        HSCore.components.HSFlatpickr.init('#eventDateRangeLabel4');       


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
