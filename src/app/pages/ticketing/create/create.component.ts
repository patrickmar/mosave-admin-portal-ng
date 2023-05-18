import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { DataService } from 'src/app/services/data.service';
import { StatService } from 'src/app/services/stat.service';
import { ToastService } from 'src/app/services/toast.service';
declare var HSCore: any;
declare var HSSideNav: any;
declare var HSAddField: any;
declare var HSBsDropdown: any;
declare var HSQuantityCounter: any;
// export interface LocalFile {
//   file: LocalFile2[];
//   base64URL: string;
// }

// export interface LocalFile2 {
//   name: string;
//   size: string;
// }

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})

export class CreateComponent implements OnInit {  
  tableHead = ["Name", "Price", "Disc. Price", "Wallet Disc.", "Quantity", "Action"];
  eventTypes = ["Festival", "Conference", "Seminar", "Executive Meeting", "Webinar", "Comedy", "Gala Night", "Musical show", "Trade Fair", "Others",]
  ticketForm: FormGroup;
  showEndDate: boolean = false;
  loading: boolean = false;
  maxQty = 10000;
  maxFileSize = 1000000;
  showSeat: boolean = false;
  allMerchants!: Array<any>;
  setFiles: Array<any> = [];
  files: File[] = [];
  bearers = [{name:"MoLoyal", value: "account"}, {name:"Client", value: "subaccount"}]

  constructor(private fb: FormBuilder, private dataService: DataService, 
    private toastService: ToastService, private statService: StatService) {
    this.getAllMerchants();

    this.ticketForm = this.fb.group({
      eventTitle: ['', [Validators.required, Validators.minLength(5)]],
      venue: ['', [Validators.required, Validators.minLength(5)]],
      merchantId: new FormControl(0, Validators.required),
      submerchantId: new FormControl(0, Validators.required),
      paystackAcctId: ['', [Validators.required, Validators.minLength(5)]],
      vendor: ['', [Validators.minLength(2)]],
      chargesBearer: ['', [Validators.required, Validators.minLength(2)]],
      eventType: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(2)]],
      tags: ['', [Validators.minLength(5)]],
      seatCapacity: new FormControl(0),
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
    this.addStartDate();
    this.addEndDate();
  }

  displayEndDate() {
    if (this.showEndDate == false) {
      this.showEndDate = true;
    } else {
      this.showEndDate = false;
      this.endDate().at(0).get('date')?.setValue("");
      this.endDate().at(0).get('time')?.setValue("");
    }
  }

  displaySeat() {
    if (this.showSeat == false) {
      this.showSeat = true;
    } else {
      this.showSeat = false;
    }
  }


  ticketCategories(): FormArray {
    return this.ticketForm.get("ticketCategories") as FormArray
  }

  startDate(): FormArray {
    return this.ticketForm.get("start") as FormArray
  }

  endDate(): FormArray {
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

  newDate(): FormGroup {
    return this.fb.group({ date: '', time: '' })
  }


  addTicket() {
    this.ticketCategories().push(this.newCategory());
  }

  addStartDate() {
    this.startDate().push(this.newDate());
  }

  addEndDate() {
    this.endDate().push(this.newDate());
  }


  removeTicket(i: number) {
    this.ticketCategories().removeAt(i);
  }

  removeEndDate(i: number) {
    this.endDate().removeAt(i);
  }

  updateMerchant(event: any){
   const value = this.allMerchants.filter((obj)=>{
      return obj.merchantId === event.target.value;
    })
    this.ticketForm.get('merchantId')?.setValue(value[0].programId);
  }

  getAllMerchants() {
    try {
      this.dataService.getAllMerchants().subscribe((res: any) => {
        this.allMerchants = res;
      }, (error: any)=>{
        this.toastService.showError(error?.message, 'Error');
      })
    } catch (error) {
      console.log(error);
      this.toastService.showError('Could not fetch all Merchants', 'Error');
    }
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

  dataURItoBlob4(dataURI: any) {
    console.log(dataURI);
    const binary = atob(dataURI.split(',')[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {
      type: 'image/png'
    });
  }

   getBase64 (file: any) {
    return new Promise(resolve => {
      //let baseURL = "";
      // Make new FileReader
      let reader = new FileReader();
      // Convert the file to base64 text
      reader.readAsDataURL(file);
      // on reader load something...
      reader.onload = () => {
        // Make a fileInfo Object
        const baseURL = reader.result;
        resolve(baseURL);
      };
    });
  };

  compressImage(src: any, newX: number, newY: number) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const elem = document.createElement('canvas');
        elem.width = newX;
        elem.height = newY;
        const ctx = elem.getContext('2d');
        ctx?.drawImage(img, 0, 0, newX, newY);
        const data = ctx?.canvas.toDataURL();
        res(data);
      }
      img.onerror = error => rej(error);
    })
  }

  onSelect(e: any) {
    if(e.addedFiles.length > 0){
      this.files.push(...e.addedFiles);
      var regex = /(\.jpg|\.jpeg|\.svg|\.pdf|\.gif|\.png)$/i;
      let file2 = e.addedFiles;
      const doe = [...this.setFiles];
      for (let i = 0; i < file2.length; i++) {
        const doc = file2[i];
        if (!regex.exec(doc.name)) {
          this.toastService.showError("Accepted file format is (.png, .jpg, .jpeg, .pdf)", 'Error');
        } else if (doc.size > 1000000) {
          this.toastService.showError("Maximum of 1MB file size is allowed", 'Error');
        } else {
          // if we want to compress the image. newX is width, newY is height
          // this.compressImage(doc, 100, 100).then(compressed => {
          //   this.resizedBase64 = compressed;
          //   console.log(this.resizedBase64);
          // })
          this.getBase64(doc).then((result: any) => {
            doc["base64"] = result;
            doe.push({ file: doc, base64URL: result });
            this.setFiles = doe;
          }).catch((err: any) => {
          });
        }
      }

    }else if(e.rejectedFiles.length > 0) {
      for (let i = 0; i < e.rejectedFiles.length; i++) {
        if(e.rejectedFiles[i].reason === "type"){
          this.toastService.showError('Accepted file format is (.png, .jpg, .jpeg, .pdf)', 'Error');
        }else if( e.rejectedFiles[i].reason === "size") {
          this.toastService.showError('Maximum of ' +  this.statService.getFilesize(this.maxFileSize, false) +' file size is allowed', 'Error');
        } else {
          this.toastService.showError('Unknown Error. Please try another file', 'Error')
        }        
      }
    }


    // const formData = new FormData();

    // for (var i = 0; i < this.files.length; i++) {
    //   formData.append("file[]", this.files[i]);
    // }
    // console.log(formData);
  }

  onRemove(item: any, e?: any) {
    this.files.splice(this.files.indexOf(item), 1);
    this.setFiles.splice(this.setFiles.indexOf(item), 1);
    if(e != undefined){
      e.preventDefault();
      e.stopPropagation();
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
    if (this.setFiles.length == 0) {
      this.toastService.showError('Banner can not be empty', 'Error');
    } else {
      const startDate = moment(this.ticketForm.value.start[0].date);
      const endDate = moment(this.ticketForm.value.end[0].date);
      console.log(endDate.isBefore(startDate));
      if (endDate.isBefore(startDate)) {
        this.toastService.showError('Event end date must be greater than start date.', 'Error');
    }else {     
      this.loading = true;
      const formData = new FormData();
      for (var i = 0; i < this.setFiles.length; i++) {
        const fileName = new Date().getTime()+''+Math.floor(Math.random() * 10000) + '.png';
        const response = await fetch(this.setFiles[i].file.base64);
        const blob = await response.blob();
        // const blob2 = this.dataURItoBlob4(this.setFiles[i].file.base64);
        formData.append("banner[]", blob, fileName);
      }      
    //remove array from the form object
    //  const  {ticketCategories, start, end, ...newForm} = form;
    //  console.log(newForm);
    //  console.log(form);

      Object.keys(form).forEach((key) => {
          Array.isArray(form[key]) ? 
          form[key].forEach((value: any) => { formData.append(key + '[]', JSON.stringify(value))}) : formData.append(key, form[key])
      });
      // formData.forEach((value, key) => {
      //   console.log(key + ": " + value);
      // });

      try {
        this.dataService.createEventTicket(formData).subscribe((res: any) => {
          console.log(res);
          this.loading = false;
          if (res.error == false) {            
            this.ticketForm.reset();
            this.ticketCategories().controls.length = 1;
            // this.removeAll(this.setFiles)
            // this.removeAll(this.files);  
            this.setFiles.length = 0;
            this.files.length = 0;  
            this.toastService.showSuccess(res?.message, 'Success');        
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
  }

  getFilesize(size: number) {
   return this.statService.getFilesize(size, true);
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

  jsInit2() {
    (function () {
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
