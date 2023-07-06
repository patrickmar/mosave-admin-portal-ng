import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { CountryPhone } from 'src/app/models/country-phone.model';
import { DataService } from 'src/app/services/data.service';
import { StatService } from 'src/app/services/stat.service';
import { ToastService } from 'src/app/services/toast.service';
import { PasswordValidator } from 'src/app/validators/password.validator';
import { PhoneValidator } from 'src/app/validators/phone.validator';
declare var HSCore: any;

@Component({
  selector: 'app-create-program',
  templateUrl: './create-program.component.html',
  styleUrls: ['./create-program.component.css']
})
export class CreateProgramComponent implements OnInit {
  programForm!: FormGroup;
  matching_passwords_group: FormGroup;
  country_phone_group: FormGroup;
  countries!: Array<CountryPhone>;
  defaultCountry!: Array<CountryPhone>;
  response: any;
  loading!: boolean;
  clicked = false;
  programType!: any;
  img!: string;
  states!: Array<any>;
  setFiles: Array<any> = [];
  files: File[] = [];
  maxFileSize: number = 1000000;
  allPrograms!: Array<any>;
  show: boolean = false;
  inputType: string = 'password';
  passwordIcon: string = 'bi-eye-slash';
  show2: boolean = false;
  inputType2: string = 'password';
  passwordIcon2: string = 'bi-eye-slash';

  constructor(private toastService: ToastService, private dataService: DataService,
    private route: ActivatedRoute, private titleCasePipe: TitleCasePipe, private router: Router,
    private statService: StatService) {
    this.defaultCountry = [
      new CountryPhone('NG', 'Nigeria'),
    ];

    this.fetchAllPrograms();


    const country = new FormControl('', Validators.required);
    const phoneno = new FormControl('', Validators.compose([
      Validators.required,
      PhoneValidator.invalidCountryPhone(country)
    ]));
    const contactPhoneNumber = new FormControl('', Validators.compose([
      Validators.required,
      PhoneValidator.invalidCountryPhone(country)
    ]));
    this.country_phone_group = new FormGroup({
      country: country,
      phoneno: phoneno,
      contactPhoneNumber: contactPhoneNumber
    });

    this.matching_passwords_group = new FormGroup({
      password: new FormControl('', Validators.compose([
        Validators.minLength(8),
        Validators.required,
        Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')
      ])),
      confirmPassword: new FormControl('', Validators.required)
    }, (formGroup: AbstractControl) => {
      if (formGroup instanceof FormGroup) {
        return PasswordValidator.areNotEqual(formGroup)
      }
      throw new Error('formGroup is not an instance of FormGroup');

    });

    this.programForm = new FormGroup({
      programId: new FormControl('', Validators.required),
      merchantName: new FormControl('', Validators.required),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      cperson: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      country_phone: this.country_phone_group,
      matching_passwords: this.matching_passwords_group,
    });

    this.getAllCountries();
    this.getProgramType();
  }

  validations = {
    merchantName: [
      { type: 'required', message: this.titleCasePipe.transform(this.getProgramType()) + ' Name is required.' }
    ],
    programId: [
      { type: 'required', message: 'Program Id is required.' }
    ],
    address: [
      { type: 'required', message: 'Address is required.' }
    ],
    city: [
      { type: 'required', message: 'City is required.' }
    ],
    state: [
      { type: 'required', message: 'State is required.' }
    ],
    email: [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Enter a valid email.' }
    ],
    phoneno: [
      { type: 'required', message: 'Phone Number is required.' },
      { type: 'invalidCountryPhone', message: 'Phone number is incorrect for the selected country.' },
      { type: 'minlength', message: 'Phone number  must be at least 11 characters long.' },
      { type: 'maxlength', message: 'Phone number cannot be more than 11 characters long.' },
    ],
    contactPhoneNumber: [
      { type: 'required', message: 'Contact Phone Number is required.' },
      { type: 'invalidCountryPhone', message: 'Contact Phone number is incorrect for the selected country.' },
      { type: 'minlength', message: 'Contact Phone number  must be at least 11 characters long.' },
      { type: 'maxlength', message: 'Contact Phone number cannot be more than 11 characters long.' },
    ],
    cperson: [
      { type: 'required', message: 'Contact Person is required.' }
    ],
    country: [
      { type: 'required', message: 'Country is required.' }
    ],
    password: [
      { type: 'required', message: 'Your password is required.' },
      { type: 'minlength', message: 'Password must be at least 8 characters long.' },
      { type: 'pattern', message: 'Your password must contain at least one uppercase, one lowercase and one number.' }
    ],
    confirmPassword: [
      { type: 'required', message: 'Confirm your Password.' }
    ],
    matching_passwords: [
      { type: 'areNotEqual', message: 'Password does not match' }
    ],
  }

  ngOnInit(): void {
    HSCore.components.HSTomSelect.init('.js-select')
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  showPassword(){
    this.show = !this.show;
      if (this.show) {
        this.inputType = 'text';
        this.passwordIcon = 'bi-eye'
      } else {
        this.inputType = 'password';
        this.passwordIcon = 'bi-eye-slash'
      }
  }

  showPassword2(){
    this.show2 = !this.show2;
      if (this.show2) {
        this.inputType2 = 'text';
        this.passwordIcon2 = 'bi-eye'
      } else {
        this.inputType2 = 'password';
        this.passwordIcon2 = 'bi-eye-slash'
      }
  }

  getProgramType() {
    this.programType = this.route.snapshot.paramMap.get('type');
    return this.programType;
  }

  fetchAllPrograms() {
    try {
      this.dataService.getAllPrograms().subscribe((res: any) => {
        this.allPrograms = res;
      }, (error: any) => {
        this.toastService.showError(error?.message, 'Error');
      })
    } catch (error) {
      this.toastService.showError('Could not fetch all ' + this.getProgramType(), 'Error');
    }
  }

  fetchStates() {
    const selectedCountry = this.programForm.value.country_phone.country.name;
    selectedCountry === "United States of America" ? "United States" : selectedCountry;
    const data = {
      "country": selectedCountry
    }
    try {
      if (this.states != undefined) {
        this.states = [];
      }
      this.dataService.fetchStatesByCountry(data).subscribe((res: any) => {
        if (res.error == false) {
          this.states = res.data.states;
        } else {
          this.toastService.showError(res.msg, 'Error');
        }
      }, (error: any) => {
        this.toastService.showError(error.msg, 'Error');
      })
    } catch (error) {
      console.log(error);
      this.toastService.showError('Please check your internet', 'Error');
    }
  }

  getAllCountries() {
    try {
      this.dataService.getAllCountries().subscribe((res: any) => {
        const phoneUtil = PhoneNumberUtil.getInstance();
        this.countries = [];
        for (let i = 0; i < res.length; i++) {
          const country = res[i];
          if (phoneUtil.getCountryCodeForRegion(country.alpha2Code)) {
            this.countries.push(new CountryPhone(country.alpha2Code, country.name))
            //this.countries.push(new CountryPhone(country.cca2, country.name.common)); // version 3
          }
        }
        const defaultCountry = this.countries.filter((c: any) => {
          return c.iso === this.defaultCountry[0].iso || c.name === this.defaultCountry[0].name
        });
        this.programForm.get('country_phone')?.get('country')?.setValue(defaultCountry[0]);
        if (this.programForm.value.country_phone.country.name != undefined) {
          this.fetchStates();
        }
      }, (error: any) => {
        this.toastService.showError('Error while fetching countries', 'Error')
      })
    } catch (error) {
      this.toastService.showError('Please check your internet and try again later', 'Error')
    }
  }

  deleteImage() {
    this.setFiles.length = 0;
    this.files.length = 0;
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

  dataURItoBlob(dataURI: any) {
    const binary = atob(dataURI.split(',')[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {
      type: 'image/png'
    });
  }

  async submit() {
    const value = this.programForm.value;
    if (this.setFiles.length > 0) {
      if (this.programForm.valid) {
        const formData = new FormData();        
          const fileName = new Date().getTime() + '' + Math.floor(Math.random() * 10000) + '.png';
          const response = await fetch(this.setFiles[0].file.base64);
          const blob = await response.blob();
          formData.append("logo", blob, fileName);        
        const data: any = {
          //merchantid: value.merchantId,
          password: value.matching_passwords.password,
          merchantname: value.merchantName,
          email: value.email,
          address: value.address,
          city: value.city,
          state: value.state,
          country: value.country_phone.country.name,
          cperson: value.cperson,
          cpersonNo: value.country_phone.contactPhoneNumber,
          phonno: value.country_phone.phoneno,
          programId: value.programId
        }
        Object.keys(data).forEach((key) => {
          formData.append(key, data[key]);
        });
        try {
          this.loading = true;
          const api = this.programType === 'merchant' ? this.dataService.createMerchant(formData) : this.dataService.createProgram(formData);
          api.subscribe((res: any) => {
            this.response = res;
            if (res.error == false) {
              this.loading = false;
              this.toastService.showSuccess(res.message, 'success');
              this.programForm.reset();
            } else {
              this.loading = false;
              this.toastService.showError(res.message, 'Error');
            }
          },
            (error: any) => {
              console.log(error);
              this.loading = false;
              this.toastService.showError(error.message, 'Error');
            })
          
        } catch (error) {
          this.loading = false;
          console.log(error);
          this.toastService.showError('Please check your internet and try again later', 'Error');
        }

      } else {
        this.toastService.showError('Please enter all fields', 'Error');
      }
    } else {
      this.toastService.showError('Please upload ' + this.titleCasePipe.transform(this.getProgramType()) + ' logo', 'Error');
    }
  }

}
