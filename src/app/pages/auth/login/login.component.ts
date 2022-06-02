import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthConstants } from 'src/app/config/auth-constants';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
declare var HSTogglePassword:any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  logo = "../../../assets/img/logo/logo.png";
  loginForm!: FormGroup;
  response: any;
  public loading!: boolean;
  clicked = false;

  constructor(private authService: AuthService, 
    private storageService: StorageService,
    private router: Router,
    private toastService: ToastService,
    private renderer: Renderer2) { }

  ngOnInit(): void {    
    new HSTogglePassword('.js-toggle-password');
    this.renderer.removeClass(document.body, 'navbar-vertical-aside-show-xl');   
    this.loginForm = new FormGroup({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(11),
        
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required
      ]))
    }); 
  }

  validateInputs() {
    let email = this.loginForm.value.email;
    let password = this.loginForm.value.password;
    return (
      this.loginForm.value.email && this.loginForm.value.password &&
      email.length > 0 && password.length > 0
    );
  }

  async login(){
    console.log(this.loginForm.value);
    if (this.validateInputs()) {
      this.loading = true;
      this.authService.login(this.loginForm.value).subscribe(
        (res: any) => {
          console.log(res);
          this.response = res;
          if (this.response.sn) {
            // Store the User data and generate an encrypted token.
            this.storageService
              .store(AuthConstants.AUTH, res).then(result => {
                this.loading = false;
                  console.log(result);    
                  console.log('go to dashboard');
                  this.toastService.showSuccess('Login Successful', 'Success');
                  this.router.navigate(['dashboard']);                
              });
          } else {
            //this.loadingService.dismissLoading();
            this.loading = false;
            console.log(res.message);
            this.toastService.showError(res.message, 'Error');
          }
        },
        (error: any) => {
          //this.loadingService.dismissLoading();
          this.loading = false;
          console.log(error + 'Error: Something went wrong.');
          this.toastService.showError('Error: Something went wrong', 'Error');
        }
      );
    } else {
      //this.loadingService.dismissLoading();
      console.log('Please enter UserId and password.');
      this.toastService.showError('Please enter UserId and password', 'Error');
    }

  }
  ngOnDestroy(): void {
    this.renderer.addClass(document.body, 'navbar-vertical-aside-show-xl');
  }

}
