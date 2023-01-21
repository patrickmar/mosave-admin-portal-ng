import { state } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
declare var HSBsDropdown:any;
declare var HSCore:any;
declare var HSFileAttach:any;
declare var HSStickyBlock:any;
declare var bootstrap:any;
declare var HSScrollspy:any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user!: any;
  profileForm!: FormGroup;
  changePasswordForm!: FormGroup;
  loading?: boolean = false;
  emailForm!: FormGroup;
  logo = environment.mini_logo;
  otp!: string;
  otp2!: string;
  otp3!: string;
  otp4!: string;
  otp5!: string;
  data: any;
  showOtpComponent = true;
  otpLength!: number;
  otpLength2!: number;
  otpLength3!: number;
  otpLength4!: number;
  otpLength5!: number;
  userRole!: Array<any>; 
  roles = [
    {
      id: 1,
      role: "Agent"
    },
    {
      id: 2,
      role: "Supervisor"
    },
    {
      id: 3,
      role: "Admin"
    },
    {
      id: 4,
      role: "SuperAdmin"
    },
  ] 

  @ViewChild('ngOtpInput', { static: false }) ngOtpInput: any;
  config = {
    allowNumbersOnly: true,
    length: 4,
    isPasswordInput: true,
    disableAutoFocus: true,
    placeholder: '',
    inputStyles: {
      'width': '50px',
      'height': '50px'
    }
  };
  response: any;

  constructor(private authservice: AuthService, private toastService: ToastService, 
    private dataService: DataService,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.jsInit();
    this.getUserDetails();
    this.profileForm = new FormGroup({
      firstname: new FormControl(this.user?.firstname, Validators.required),
      lastname: new FormControl(this.user?.lastname, Validators.required),
      phone: new FormControl(this.user?.phone, Validators.required),
      role: new FormControl({value: this.userRole[0].role, disabled: true}, Validators.required),
      city: new FormControl(this.user?.city, Validators.required),
      state: new FormControl(this.user?.state, Validators.required),
      country: new FormControl(this.user?.country, Validators.required),
      address: new FormControl(this.user?.address, Validators.required),
    });
    this.emailForm=new FormGroup({
      email: new FormControl({value: this.user?.email, disabled: true}, Validators.required),
    })

    this.changePasswordForm = new FormGroup({
      currentPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', Validators.required),
      confirmNewPassword: new FormControl('', Validators.required),
    })
  }

  setVal(val: string) {
    this.ngOtpInput.setValue(val);
  }

  onOtpChange(otp: any) {
    this.otp = otp;
    this.otpLength = this.otp.length;
  }
  onOtpChange2(otp: any) {
    this.otp2 = otp;
    this.otpLength2 = this.otp2.length;
  }

  onOtpChange3(otp: any) {
    this.otp3 = otp;
    this.otpLength4 = this.otp3.length;
  }
  onOtpChange4(otp: any) {
    this.otp4 = otp;
    this.otpLength4 = this.otp4.length;
  }
  onOtpChange5(otp: any) {
    this.otp5 = otp;
    this.otpLength5 = this.otp5.length;
  }
  
  getUserDetails(){
    this.authservice.userData$.subscribe((response: any) => {
      console.log(response);
      this.user = response;
      this.userRole = this.roles.filter((i: any) => i.id === Number(this.user.level));
    });
  }

  update(){
    console.log(this.profileForm.value);
    this.loading = true;
    this.dataService.updateAgentProfile(this.profileForm.value).subscribe((result: any) => {
      console.log(result);
      this.loading = false;
      this.response = result;
      if (this.response.error == false) {
        this.toastService.showSuccess( this.response.message, 'Success');
      }else {
        this.toastService.showError(this.response.message, 'Error');
      }
    }, (error: any) => {
        this.loading = false;
        console.log(error);
        this.toastService.showError('Error: Something went wrong', 'Error');
      });
  }

  changeEmail(){
    console.log(this.emailForm.value);
  }

  changePassword(): void {
    const form = this.changePasswordForm.value;
    console.log(form);
    if(form.newPassword == form.confirmNewPassword){
      const PasswordData = {
        agentid: this.user.phone,
        oldpassword: form.currentPassword,
        newpassword: form.newPassword
      }
      console.log(PasswordData);
      this.loading = true;
        this.dataService.changeAgentPassword(PasswordData).subscribe((res: any) =>{
          console.log(res);
          if(res.error == false){
            this.loading = false;
            this.toastService.showSuccess(res.message, "Success");
            this.authService.logout();
          }else{
            this.loading = false;
            this.toastService.showError(res.message, "Error");
          }
  
        },(error: any) => {
          this.loading = false;
          console.log(error, 'Error');
          this.toastService.showError('Error: something went wrong', 'Error');
        });

    } else{
      this.toastService.showError('Error: Passwords not the same', 'Error');
    }    
  }

  setPin(){
    console.log(this.otp);
    console.log(this.otp2);
    if(this.otp == this.otp2){
      const pinData = {
        pin: this.otp,
        agentid: this.user.sn,
      }
      this.loading = true;
      this.dataService.createTransactionPin(pinData).subscribe((result: any) => {        
        console.log(result);
        this.loading = false;
        if(result.pinbool){
          this.toastService.showSuccess(result.message, 'Success');
        }else{
          this.toastService.showError('Error: ', 'Error');
        }
      }), (error: any) => {
        this.loading = false;
        this.toastService.showError('Error: Something went wrong', 'Error');
      }
    }else{
      this.toastService.showError('Pin not same', 'Error');
    }
  }

  changePin(){
    console.log(this.otp3);
    console.log(this.otp4);
    console.log(this.otp5);
    const pinData1 = {
      pin: this.otp3,
      agentid: this.user.sn,
    }
    if(this.otp3 != null){
      if(this.otp4 == this.otp5){
        const pinData2 = {
          newpin: this.otp4,
          agentphone: this.user.phone,
        }
        this.loading = true;
        this.dataService.verifyTransactionPin(pinData1).subscribe((result: any) => {
          console.log(result);
          if (result.verified == 1) {
            this.dataService.resetAgentPin(pinData2).subscribe((result: any) => {        
              console.log(result);
              this.loading = false;
              if(result.pinbool == true){
                this.toastService.showSuccess(result.response, 'Success');
              }else{
                this.toastService.showError(result.message, 'Error');
              }
            }), (error: any) => {
              this.loading = false;
              this.toastService.showError('Error: Something went wrong', 'Error');
            }  
          }else {
            this.loading = false;
            this.toastService.showError(result.message, 'Error');
          }
      })
      }else {
        this.toastService.showError('Pin not same', 'Error');
      }
    }else {
      this.toastService.showError('Please enter your current pin', 'Error');
  }
    
  }


  jsInit(){
    window.onload = function () {

      // INITIALIZATION OF BOOTSTRAP DROPDOWN
      // =======================================================
      HSBsDropdown.init()

      // INITIALIZATION OF INPUT MASK
      // =======================================================
      HSCore.components.HSMask.init('.js-input-mask')


      // INITIALIZATION OF FILE ATTACHMENT
      // =======================================================
      new HSFileAttach('.js-file-attach')


      // INITIALIZATION OF STICKY BLOCKS
      // =======================================================
      new HSStickyBlock('.js-sticky-block', {
        targetSelector: document.getElementById('header')?.classList.contains('navbar-fixed') ? '#header' : null
      })


      // SCROLLSPY
      // =======================================================
      new bootstrap.ScrollSpy(document.body, {
        target: '#navbarSettings',
        offset: 100
      })

      new HSScrollspy('#navbarVerticalNavMenu', {
        breakpoint: 'lg',
        scrollOffset: -20
      })

        // INITIALIZATION OF SELECT
      // =======================================================
      HSCore.components.HSTomSelect.init('.js-select')
    }
  }

}
