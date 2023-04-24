import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { CountryPhone } from 'src/app/models/country-phone.model';
import { DataService } from 'src/app/services/data.service';
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

  constructor(private toastService: ToastService, private dataService: DataService,
    private route: ActivatedRoute, private titleCasePipe: TitleCasePipe, private router: Router) {
      this.defaultCountry = [
          new CountryPhone('NG', 'Nigeria'),      
        ];
      
  
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
        merchantId: new FormControl('', Validators.required),
        merchantName: new FormControl('', Validators.required),      
        img: new FormControl('', Validators.required),
        email: new FormControl('', Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        //password: new FormControl('', Validators.required),
  
        cperson: new FormControl('', Validators.required),
        
        
        address: new FormControl('', Validators.required),
        city: new FormControl('', Validators.required),
        state: new FormControl('', Validators.required),
        // country: new FormControl('', Validators.required),
        country_phone: this.country_phone_group,
        matching_passwords: this.matching_passwords_group,
      });
      
      this.getAllCountries();
      this.getProgramType();      
     }

    validations = {
      merchantName: [
        { type: 'required', message: this.titleCasePipe.transform(this.getProgramType()) +' Name is required.' }
      ],
      merchantId: [
        { type: 'required', message: this.titleCasePipe.transform(this.getProgramType()) +' Id is required.' }
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
        { type: 'required', message: 'contact Phone Number is required.' },
        { type: 'invalidCountryPhone', message: 'Contact Phone number is incorrect for the selected country.' },
        { type: 'minlength', message: 'Contact Phone number  must be at least 11 characters long.' },
        { type: 'maxlength', message: 'Contact Phone number cannot be more than 11 characters long.' },
      ],
      cperson: [
        { type: 'required', message: 'contact person is required.' }
      ],
      country: [
        { type: 'required', message: 'country is required.' }
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
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  getProgramType() {
    this.programType = this.route.snapshot.paramMap.get('type');
    return this.programType;
  }

  checkImg(){
    const img  = (document.getElementById('avatarImg') as HTMLImageElement).src;
    this.img = img;
    console.log(this.img);
  }

  fetchStates(){
    const selectedCountry = this.programForm.value.country_phone.country.name;
    selectedCountry === "United States of America" ? "United States" : selectedCountry;
    console.log(selectedCountry); 
    const data = {
      "country": selectedCountry
    }
    try {
      if(this.states != undefined ){
        this.states = [];
      }
      this.dataService.fetchStatesByCountry(data).subscribe((res:any)=>{
        if(res.error == false){
          this.states = res.data.states;
        }else{
          this.toastService.showError(res.msg, 'Error');
        }
      }, (error: any)=>{
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
         console.log(this.defaultCountry)
        const defaultCountry = this.countries.filter((c:any)=>{
          return c.iso === this.defaultCountry[0].iso || c.name === this.defaultCountry[0].name
        });
        this.programForm.get('country_phone')?.get('country')?.setValue(defaultCountry[0]);
        if(this.programForm.value.country_phone.country.name != undefined){
          this.fetchStates();
        }
      }, (error: any) => {
        this.toastService.showError('Error while fetching countries', 'Error')
      })
    } catch (error) {
      this.toastService.showError('Please check your internet and try again later', 'Error')
    }
  }

  submit(){
    const value = this.programForm.value;
    console.log(value);
    try {
      if(this.programForm.valid){
        const data = {
          merchantid: value.merchantId,
          password : value.matching_passwords.password,
          merchantname : value.merchantName,
          email : value.email,
          address : value.address,
          city : value.city,
          state : value.state,
          country : value.country_phone.country.name,
          cperson : value.cperson,
          cpersonNo: value.contactPhoneNumber,
          phonno : value.country_phone.phoneno,
        }
        console.log(data);
        console.log(this.programType);
        const api = this.programType === 'merchant' ? this.dataService.createMerchant : this.dataService.createProgram;
        api(data).subscribe((res: any) =>{
          console.log(res);        
          this.response = res;
            if (this.response.error == false){ 
              this.loading = false;    
              console.log(res.message); 
              this.toastService.showSuccess(res.message, 'success');    
              this.programForm.reset();     
            }else{
              this.loading = false;
              console.log(res.message);
              this.toastService.showError(res.message, 'Error');
            }
        },
        (error: any)=> {
          console.log(error);
          this.loading = false;
          this.toastService.showError(error.message, 'Error');
        })
  
      }else{
        this.toastService.showError('Please enter all fields', 'Error');
      } 
    } catch (error) {
      this.toastService.showError('Please check your internet and try again later', 'Error')
    }
    
  }

  jsInit(){
      // INITIALIZATION OF SELECT
        // =======================================================
        HSCore.components.HSTomSelect.init('.js-select')
  }

}
