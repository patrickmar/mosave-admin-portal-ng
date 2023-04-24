import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { DataService } from 'src/app/services/data.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';

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

  tableHead = ["Name", "Price", "Disc. Price", "Wallet Disc.", "Quantity", "Action"];
  eventTypes = ["Festival", "Conference", "Seminar", "Executive Meeting", "Webinar", "Comedy", "Gala Night", "Musical show", "Trade Fair", "Others",]
  ticketForm!: FormGroup;
  showEndDate: boolean = false;
  maxQty = 10000;
  showSeat: boolean = false;
  data: object | any;
  maxCategory = 10;
  merchantList!: Array<any>;
  allMerchants!: Array<any>;
  setFiles: Array<any> = [];
  files: File[] = [];
  bearers = [{name:"MoLoyal", value: "account"}, {name:"Client", value: "subaccount"}]
  loading!: boolean;
  path = environment.app.baseUrl+ environment.app.path+ environment.app.allImagesPath;

  constructor(private fb: FormBuilder, private dataService: DataService, 
    private route: ActivatedRoute, private toastService: ToastService) { 
      this.getAllMerchants();

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
    walletDiscount: [
      { type: 'required', message: 'Wallet discount is required.' }
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
    merchantId: [
      { type: 'required', message: 'Merchant Id is required.' }
    ],
    submerchantId: [
      { type: 'required', message: 'Submerchant Id is required.' }
    ],
    paystackAcctId: [
      { type: 'required', message: 'Paystack Account is required.' }
    ],

  };

  ngOnInit(): void {
    this.jsInit();
    this.jsInit2();
    // this.addTicket();
    // this.addStartDate();
    // this.addEndDate();
    //this.getAllTickets();
    // this.getTicketId();
    
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
      const filter = res.data.filter((val: any) =>{
        return val.sn == this.getTicketId();
      });
      this.data = filter[0];
      const data = this.data;

      const ticketForm = {
        eventTitle: data?.title,  
        venue: data?.venue,
        submerchantId: data?.submerchantId,
        paystackAcctId: data?.Paystack_Acct,
        vendor: data?.vendor,
        chargesBearer: data?.paystack_bearer,
        eventType: data?.event_cat,
        description: data?.des,
        tags: data?.tags,
        seatCapacity: Number(data?.seat_capacity),
        enableEvent: data?.status === "Active" ? true : false,
        enableSeat: data?.enableseat === "1" ? true : false,
      };

      this.ticketForm.patchValue(ticketForm);
      if(Array.isArray(this.data?.ticketCategories) && this.data?.ticketCategories?.length > 0){
      this.data?.ticketCategories?.map((item: any) => {
        const ticket = this.fb.group({
          name: item?.name,
          price: item?.price,
          qty: item?.quantity,
          discountPrice: item?.discount_price,
          walletDiscount: item?.wallet_discount,
        });
        this.ticketCategories().push(ticket);
      });
    }

    const start = [ {date: data?.from_date, time: data?.from_time}]
    const end = [ { date: data?.to_date, time: data?.to_time }  ]

      if(Array.isArray(start) && start?.length > 0 ){  
        start?.map((item: any) => {      
          const start = this.fb.group({
            date: item?.date,
            time: item?.time
          });
          this.startDate().push(start); 
        });         
      }else{
        this.addStartDate();
      }      

        if(Array.isArray(end) && end?.length > 0 ){ 
          end?.map((item: any) => {       
          const end = this.fb.group({
            date: item?.date,
            time: item?.time
          });
          this.endDate().push(end); 
        });      
      }else{
        this.addEndDate();
      }

      this.showEndDate = this.ticketForm.value.end[0].date !== '' ? true : false;
      this.showSeat = this.ticketForm.value.enableSeat == true ? true : false;    

    });
  }

  getTicketId() {
    const ticketId = this.route.snapshot.paramMap.get('sn');
    return ticketId; 
  }

  getAllMerchants() {
    try {
      this.dataService.getAllMerchants().subscribe((res: any) => {
        this.allMerchants = res;
      })
    } catch (error) {
      console.log(error);
      this.toastService.showError('Could not fetch all Merchants', 'Error');
    }
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
      walletDiscount: this.fb.control(0, Validators.compose([
        Validators.min(0),
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

  

  handleMinus(e: any, index: number, name: string, minQty: number) {
    let value = this.ticketForm.get("ticketCategories")?.value[index]?.[name];
    if (value === minQty) {
      e.preventDefault();
    } else {
      const newValue = value - 1;
      this.ticketCategories().at(index).get(name)?.setValue(newValue);
    }
  }
  handlePlus(e: any, index: number, name: string, maxQty: number) {
    let value = this.ticketForm.get("ticketCategories")?.value[index]?.[name];
    if (value === maxQty) {
      e.preventDefault();
    } else {
      const newValue = value + 1;
      this.ticketCategories().at(index).get(name)?.setValue(newValue);
    }
  }

  removeAll(array: Array<any>){
    for (let i = 0; i < array.length; i++) {
      const element = array[i]; 
      array.splice(array.indexOf(element), 1);
    }
  }
     
  async onSubmit() {
    var val = $("#quillArea .ql-editor").html();
    this.ticketForm.get('description')?.setValue(val);  
    const form = this.ticketForm.value;
    console.log(form);
     
      const startDate = moment(this.ticketForm.value.start[0].date);
      const endDate = moment(this.ticketForm.value.end[0].date);
      if (endDate.isBefore(startDate)) {
        this.toastService.showError('Event end date must be greater than start date.', 'Error');
    }else {     
      this.loading = true;
      const formData = new FormData();
      const eventId = String(this.getTicketId());
      formData.append("eventid", eventId);
      if (this.setFiles.length > 0) {
        for (var i = 0; i < this.setFiles.length; i++) {
          const fileName = new Date().getTime()+''+Math.floor(Math.random() * 10000) + '.png';
          const response = await fetch(this.setFiles[i].file.base64);
          const blob = await response.blob();
          formData.append("banner[]", blob, fileName);
        }
      }      

      Object.keys(form).forEach((key) => {
          Array.isArray(form[key]) ? 
          form[key].forEach((value: any) => { formData.append(key + '[]', JSON.stringify(value))}) : formData.append(key, form[key])
      });
      // formData.forEach((value, key) => {
      //   console.log(key + ": " + value);
      // });

      try {
        this.dataService.updateEventTicket(formData).subscribe((res: any) => {
          console.log(res);
          this.loading = false;
          if (res.error == false) {
            this.toastService.showSuccess(res?.message, 'Success');
            this.removeAll(this.setFiles)
            this.removeAll(this.files);            
          } else {
            this.toastService.showError(res?.message, 'Error');   
          }
        }, (error: any)=>{
          this.loading = false;
          console.log(error);
          this.toastService.showError(error?.message, 'Error');
        })
      } catch (error) {
        this.loading = false;
        console.log(error);
        this.toastService.showError('Could not create ticket. Please try again later', 'Error');
      }
    }

    
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
