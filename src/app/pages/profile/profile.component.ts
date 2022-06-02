import { state } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
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
  emailForm!: FormGroup;
  logo = environment.mini_logo;

  constructor(private authservice: AuthService) { }

  ngOnInit(): void {
    this.jsInit();
    this.getUserDetails();

    this.profileForm = new FormGroup({
      firstname: new FormControl(this.user?.firstname, Validators.required),
      lastname: new FormControl(this.user?.lastname, Validators.required),
      phone: new FormControl(this.user?.phone, Validators.required),
      role: new FormControl({value: this.user?.role, disabled: true}, Validators.required),
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

  getUserDetails(){
    this.authservice.userData$.subscribe((response: any) => {
      console.log(response);
      this.user = response;
    });
  }

  update(){
    console.log(this.profileForm.value);
  }

  changeEmail(){
    console.log(this.emailForm.value);
  }

  changePassword(){
    console.log(this.changePasswordForm.value);
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
