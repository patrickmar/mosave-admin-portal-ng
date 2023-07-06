import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { iDeactivateComponent } from 'src/app/services/form-check.service';
import { StepsService } from 'src/app/services/steps.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
import { StepModel } from '../../models/step.model';
import { Observable } from 'rxjs';
import { StatService } from 'src/app/services/stat.service';
import { AuthService } from 'src/app/services/auth.service';

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
  styleUrls: ['./register-customer.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterCustomerComponent implements OnInit, iDeactivateComponent {
  registerForm!: FormGroup;
  response: any;
  loading: boolean = false;
  //clicked = false;
  img!: string;
  currentStep?: Observable<StepModel>;
  stepMax = 3;
  stepCounter = 0;
  stepArray = [true, false, false];
  formTitle = ['Personal Information', 'Contact Address', 'Confirmation'];
  setFiles: Array<any> = [];
  files: File[] = [];
  maxFileSize: number = 1000000;
  user: any;

  constructor(private dataService: DataService, private toastService: ToastService,
    private http: HttpClient, private stepsService: StepsService, private authservice: AuthService,
    private router: Router, private statService: StatService) {
    this.getUserDetails();
  }

  ngOnInit(): void {
    this.loadScript();

    this.currentStep = this.stepsService.getCurrentStep();
    this.registerForm = new FormGroup({
      agentId: new FormControl(this.user.sn, Validators.required),
      sn: new FormControl(this.user.sn, Validators.required),
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      phoneno: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      location: new FormControl('', Validators.required),
      bvn: new FormControl('', Validators.compose([Validators.minLength(11), Validators.maxLength(11)])),
      organization: new FormControl('',),
      accountType: new FormControl('', Validators.required),
      city: new FormControl('',),
      state: new FormControl(''),
      country: new FormControl(''),
      address: new FormControl(''),
    })
  }

  getUserDetails() {
    this.authservice.userData$.subscribe((response: any) => {
      this.user = response;
    });
  }

  // getAgentId(value: string){
  //   return this.authservice.userData$.subscribe((response: any) => {
  //     console.log(response);
  //     this.user = response;
  //   });
  // }

  stepForward() {
    this.stepArray[this.stepCounter] = false;
    this.stepCounter++;
    if (this.stepCounter > this.stepArray.length - 1) {
      this.stepCounter = this.stepArray.length - 1;
    }

    this.stepArray[this.stepCounter] = true;
  }

  stepBackward() {
    this.stepArray[this.stepCounter] = false;
    this.stepCounter--;
    if (this.stepCounter < 0) {
      this.stepCounter = 0;
    }
    this.stepArray[this.stepCounter] = true;
  }

  canExit() {
    if (this.registerForm.valid) {
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

  async register() {
    if (this.setFiles.length > 0) {
      if (this.registerForm.valid) {
        this.loading = true;
        const formData = new FormData();
        const fileName = new Date().getTime() + '' + Math.floor(Math.random() * 10000) + '.png';
        const response = await fetch(this.setFiles[0].file.base64);
        const blob = await response.blob();
        formData.append('photo', blob, fileName);
        const form = this.registerForm.value;
        Object.keys(form).forEach((key) => {
          formData.append(key, form[key]);
        });

        // formData.forEach((value, key) => {
        //   console.log(key + " " + value);
        // });
        const serviceName = "customer/register";
        const url = environment.app.baseUrl + environment.app.path + serviceName;
        //this.dataService.registerCustomer(formData)
        this.http.post(url, formData).pipe(finalize(() => { }))
          .subscribe((res: any) => {
            this.response = res;
            this.loading = false;
            if (res.error == false) {
              this.toastService.showSuccess(this.response.message + 'The Account number is' + this.response.account_num, 'Success');
              this.registerForm.reset();
              this.deleteImage();
            } else {
              this.toastService.showError(this.response.message, 'Error');
            }
          }, (error: any) => {
            this.loading = false;
            this.toastService.showError(error.statusText, 'Error');
            console.log(error);
          });

      } else {
        this.toastService.showError('Please enter all fields', 'Error');
      }
    } else {
      this.toastService.showError('Please upload the customer image', 'Error');
    }

  }

  dataURItoBlob4(dataURI: any) {
    const binary = atob(dataURI.split(',')[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {
      type: 'image/png'
    });
  }

  onSelect(e: any) {
    if (e.target.files.length > 0) {
      var regex = /(\.jpg|\.jpeg|\.svg|\.pdf|\.gif|\.png)$/i;
      const doc = e.target.files[0];
      if (!regex.exec(doc.name)) {
        this.toastService.showError("Accepted file format is (.png, .jpg, .jpeg, .pdf)", 'Error');
      } else if (doc.size > 1000000) {
        this.toastService.showError("Maximum of " + this.statService.getFilesize(this.maxFileSize, false) + " file size is allowed", 'Error');
      } else {
        // if we want to compress the image. newX is width, newY is height
        // this.compressImage(doc, 100, 100).then(compressed => {
        //   this.resizedBase64 = compressed;
        //   console.log(this.resizedBase64);
        // })
        this.setFiles.length = 0;
        this.files.length = 0;
        const doe = [...this.setFiles];
        this.files.push(...e.target.files);
        this.getBase64(doc).then((result: any) => {
          doc["base64"] = result;
          doe.push({ file: doc, base64URL: result });
          this.setFiles = doe;
          //console.log(this.setFiles);
        }).catch((err: any) => {
          console.log(err);
        });

      }
    } else {
      this.toastService.showError("Please upload a valid image", "Error")
    }
  }

  getBase64(file: any) {
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

  deleteImage() {
    this.setFiles.length = 0;
    this.files.length = 0;
  }

  loadScript() {
    window.onload = function () {


      // INITIALIZATION OF BOOTSTRAP DROPDOWN
      // =======================================================
      HSBsDropdown.init()


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

    }
  }

}
