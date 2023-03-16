import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { ToastService } from 'src/app/services/toast.service';

declare var HSCore: any;
declare var HSSideNav: any;
declare var HSAddField: any;
declare var HSBsDropdown: any;
declare var HSQuantityCounter: any;
declare var HSCore: any;

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent implements OnInit {

  tableHead = ["Name", "Price", "Disc. Price", "Quantity", "Action"];
  eventTypes = ["Festival", "Conference", "Seminar", "Executive Meeting", "Webinar", "Comedy", "Gala Night", "Musical show", "Trade Fair", "Others",]
  ticketForm!: FormGroup;
  showEndDate: boolean = false;
  maxQty = 10000;
  showSeat: boolean = false;
  data: object | any;
  maxCategory = 10;
  merchantList!: Array<any>

  constructor(private fb: FormBuilder, private dataService: DataService, 
    private route: ActivatedRoute, private toastService: ToastService) { 
      this.ticketForm = this.fb.group({
        eventTitle: ['', [Validators.required, Validators.minLength(5)]],  
        venue: ['', [Validators.required, Validators.minLength(5)]],
        submerchantId: new FormControl('', Validators.required),
        paystackAcctId: ['', [Validators.required, Validators.minLength(5)]],
        vendor: ['', [Validators.minLength(5)]],
        chargesBearer: ['', [Validators.required, Validators.minLength(5)]],
        eventType: ['', [Validators.required, Validators.minLength(5)]],
        description: ['', [Validators.required, Validators.minLength(5)]],
        tags: ['', [Validators.minLength(5)]],
        seatCapacity: new FormControl('', Validators.required),
        enableEvent: new FormControl(false),
        enableSeat: new FormControl(false),
        ticketCategories: this.fb.array([]),
        start: this.fb.array([]),
        end: this.fb.array([]),
      });
    this.getTicket();  
  }

  ngOnInit(): void {
    this.jsInit();
    this.jsInit2();
    // this.addTicket();
    this.addStartDate();
    this.addEndDate();
    //this.getAllTickets();
    // this.getTicketId();
    this.merchantList = [
      {
        id: 1,
        name: 'BME',
        merchantId: '201501'
      },
      {
        id: 2,
        name: 'Dangote',
        merchantId: '201502'
      },
      {
        id: 3,
        name: 'Fair acres',
        merchantId: '201503'
      },
      {
        id: 4,
        name: 'Muson',
        merchantId: '201504'
      },
      {
        id: 5,
        name: 'Flytime',
        merchantId: '201505'
      },
    ]
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

  getTicket(){
    this.dataService.getAllTickets().subscribe((res: any) => {
      console.log(res);    
      const filter = res.filter((val: any) =>{
        return val.id == this.getTicketId();
      });
      console.log(filter[0]);
      this.data = filter[0];
      const data = filter[0];

      const ticketForm = {
        eventTitle: data?.eventTitle,  
        venue: data?.venue,
        submerchantId: parseInt(data?.submerchantId),
        paystackAcctId: data?.paystackAcctId,
        vendor: data?.vendor,
        chargesBearer: data?.chargesBearer,
        eventType: data?.eventType,
        description: data?.description,
        tags: data?.tags,
        seatCapacity: data?.seatCapacity,
        enableEvent: data?.enableEvent,
        enableSeat: data?.enableSeat,
      };

      this.ticketForm.patchValue(ticketForm);

      this.data?.ticketCategories?.map((item: any) => {
        const ticket = this.fb.group({
          name: item?.name,
          price: item?.price,
          qty: item?.qty,
          discountPrice: item?.discountPrice
        });
        this.ticketCategories().push(ticket);
      });

      if(Array.isArray(this.data?.start) && this.data?.start?.length > 0){
        this.data?.start?.map((item: any) => {
          const start = this.fb.group({
            date: item?.date,
            time: item?.time
          });
          this.startDate().push(start);
        });
      }else{
        this.addStartDate();
      }      

      if(Array.isArray(this.data?.end) && this.data?.end?.length > 0){
        this.data?.end?.map((item: any) => {
          const end = this.fb.group({
            date: item?.date,
            time: item?.time
          });
          this.endDate().push(end);
        });
      }else{
        this.addEndDate();
      }

      

    });
  }

  getTicketId() {
    const ticketId = this.route.snapshot.paramMap.get('sn');
    return ticketId; 
  }


  ticketCategories() : FormArray {  
    return this.ticketForm?.get("ticketCategories") as FormArray
  }  

  startDate() : FormArray {  
    return this.ticketForm?.get("start") as FormArray
  } 

  endDate() : FormArray {  
    return this.ticketForm?.get("end") as FormArray
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
    if(this.ticketCategories().controls?.length <= this.maxCategory){      
    this.ticketCategories().push(this.newCategory());
    }else {
      this.toastService.showError('You can\'t add more than '+this.maxCategory, 'Error')
    }
  }

  addStartDate(){
    this.startDate()?.push(this.newDate());
  }

  addEndDate(){
    this.endDate()?.push(this.newDate());
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
      const newValue = Number(value) - 1;
      this.ticketCategories().at(index).get('qty')?.setValue(newValue);
    }
  }
  handlePlus(e: any, index: number) {
    let value = this.ticketForm.get("ticketCategories")?.value[index]?.qty;
    if (value === this.maxQty) {
      e.preventDefault();
    } else {
      const newValue = Number(value) + 1;
      this.ticketCategories().at(index).get('qty')?.setValue(newValue);
    }
  }
     
  onSubmit() {
    var val = $("#quillArea .ql-editor").html();
    this.ticketForm.get('description')?.setValue(val);  
    console.log(this.ticketForm.value);
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
