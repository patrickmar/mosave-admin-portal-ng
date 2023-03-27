import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { iDeactivateComponent } from 'src/app/services/form-check.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';

declare var HSFormSearch: any;
declare var HSBsDropdown: any;
declare var HSFileAttach: any;
declare var HSStepForm: any;
declare var HSAddField: any;
declare var HSCore: any;
declare var HSBsValidation: any;

@Component({
  selector: 'app-register-customer',
  templateUrl: './register-customer.component.html',
  styleUrls: ['./register-customer.component.css']
})
export class RegisterCustomerComponent implements OnInit, iDeactivateComponent {
  registerForm!: FormGroup;
  response: any;
  loading: boolean = false;
  //clicked = false;
  img!: string;

  constructor(private dataService: DataService, private toastService: ToastService,
    private http: HttpClient) { }

  ngOnInit(): void {
    this.loadScript();

    this.registerForm = new FormGroup({
      img: new FormControl('', Validators.required),
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      phoneno: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      location: new FormControl('', Validators.required),
      BVN_num: new FormControl('', Validators.compose([Validators.minLength(11), Validators.maxLength(11)])),
      organization: new FormControl('',),
      accountType: new FormControl('', Validators.required),
      city: new FormControl('',),
      state: new FormControl(''),
      country: new FormControl(''),
      address: new FormControl(''),
    })

    //this.checkImg();
    
  }

  canExit(){
    if (this.registerForm.valid){
      console.log(this.registerForm.value);
      return confirm('You have unsaved changes. Do you want to continue?');
    } else {
      return true;
    }
  }

  uploadImg(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.registerForm.get('img')?.setValue(event.target.files[0]);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  checkImg(){
    const img  = (document.getElementById('avatarImg') as HTMLImageElement).src;
    this.img = img;
    console.log(this.img);
  }

  register() {
    console.log(this.registerForm.value);
    this.loading = true;
    const img  = (document.getElementById('avatarImg') as HTMLImageElement).src;
   console.log(img);

   if(img == null || img == ""){
    this.toastService.showError('Image can not be empty', 'Error');
   }else {

   }

   const blob = this.dataURItoBlob4(img);
    const formData = new FormData();
    console.log(blob);
    const fileName = new Date().getTime() + '.png';
    const form = this.registerForm.value;
    formData.append('photo', blob, fileName);

    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    formData.forEach((value,key) => {
      console.log(key+" "+value);
    });
    const serviceName = "customer/register";
    const url = environment.app.baseUrl + environment.app.path + serviceName;
    //this.dataService.registerCustomer(formData)
    this.http.post(url, formData).pipe(finalize(() => { }))
    .subscribe((res:any)=>{
      this.response = res;
      console.log(this.response);
      this.loading = false;
      if(res.success == true){ 
        this.toastService.showSuccess(this.response.message, 'Success');
        //document.getElementById("successMessageContent")!.style.display = 'block'
      }else{
        this.toastService.showError(this.response.message, 'Error');
      }      
    }, (error: any)=>{
      this.loading = false;
      this.toastService.showError(error.statusText, 'Error');
      console.log(error);
    });
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

  loadScript() {
    window.onload = function () {


      // INITIALIZATION OF BOOTSTRAP DROPDOWN
      // =======================================================
      HSBsDropdown.init()


      // INITIALIZATION OF FILE ATTACH
      // =======================================================
      new HSFileAttach('.js-file-attach')


      // INITIALIZATION OF STEP FORM
      // =======================================================
      new HSStepForm('.js-step-form', {
        finish: () => {
          // document.getElementById("addUserStepFormProgress")!.style.display = 'none'
          // document.getElementById("addUserStepProfile")!.style.display = 'none'
          // document.getElementById("addUserStepBillingAddress")!.style.display = 'none'
          // document.getElementById("addUserStepConfirmation")!.style.display = 'none'
          //document.getElementById("successMessageContent")!.style.display = 'block'
          scrollToTop('#header');
          const formContainer = document.getElementById('formContainer')
        },
        onNextStep: function () {
          scrollToTop()
        },
        onPrevStep: function () {
          scrollToTop()
        }
      })

      function scrollToTop(el: any = '.js-step-form') {
        el = document.querySelector(el)
        window.scrollTo({
          top: (el.getBoundingClientRect().top + window.scrollY) - 30,
          left: 0,
          behavior: 'smooth'
        })
      }

      // INITIALIZATION OF STEP FORM
    // =======================================================
  //    new HSStepForm('.js-step-form-validate', {
  //     validator: HSBsValidation.init('.js-validate'),
  //     finish ($el: any) {
  //       const $successMessageTempalte = $el.querySelector('.js-success-message').cloneNode(true)

  //       $successMessageTempalte.style.display = 'block'

  //       $el.style.display = 'none'
  //       $el.parentElement.appendChild($successMessageTempalte)
  //     }
  //  })

      


      // INITIALIZATION OF SELECT
      // =======================================================
      HSCore.components.HSTomSelect.init('.js-select', {  
        render: {
          'option': function (data: any, escape: any) {
            return data.optionTemplate || `<div>${data.text}</div>>`
          },
          'item': function (data: any, escape: any) {
            return data.optionTemplate || `<div>${data.text}</div>>`
          }
        }
      })


      // INITIALIZATION OF INPUT MASK
      // =======================================================
      HSCore.components.HSMask.init('.js-input-mask')
    }
  }

}
