import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
declare var HSTogglePassword: any;
declare var $: any;
declare var HSCore: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  logo = '../../../assets/img/logo/logo.png';
  signupForm!: FormGroup;
  response: any;
  public loading!: boolean;
  clicked = false;

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router,
    private toastService: ToastService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    new HSTogglePassword('.js-toggle-password');

    HSCore.components.HSTomSelect.init('.js-select');

    this.renderer.removeClass(document.body, 'navbar-vertical-aside-show-xl');

    this.signupForm = new FormGroup({
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      phoneno: new FormControl('', Validators.required),
      roleid: new FormControl('', Validators.required),
      email: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ])
      ),
      password: new FormControl('', Validators.required),
    });

    $(document).on('ready', function () {
      $('.showToast').toast({
        autohide: false,
      });

      $('.showToast').toast('show');
    });
  }

  validateInputs() {
    const firstName = this.signupForm.value.firstname;
    const lastName = this.signupForm.value.lastname;
    const emailAddress = this.signupForm.value.email;
    const phoneno = this.signupForm.value.phoneno;
    const password = this.signupForm.value.password;
    return firstName && lastName && emailAddress && phoneno && password;
  }

  register(): void {
    if (this.validateInputs()) {
      this.loading = true;
      const values = this.signupForm.value;
      const signupData = {
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        phoneno: '0' + values.phoneno,
        roleid: values.roleid,
        password: values.password,
      };
      // this.loadingService.presentLoading('Processing').then(() =>{
      this.authService.register(signupData).subscribe(
        (res: any) => {
          this.response = res;
          if (this.response.error == false) {
            this.loading = false;
            this.clicked = false;
            this.toastService.showSuccess(res.message, 'success');
            this.signupForm.reset();
          } else {
            this.loading = false;
            this.toastService.showError(res.message, 'danger');
          }
        },
        (error: any) => {
          console.log(error);
          this.loading = false;
          this.clicked = false;
          const err = 'Error: Something went wrong';
          this.toastService.showError(err, 'danger');
        }
      );
      // });
    } else {
      const err = 'Please enter all fields';
      this.toastService.showError(err, 'danger');
    }
  }

  ngOnDestroy(): void {
    this.renderer.addClass(document.body, 'navbar-vertical-aside-show-xl');
  }

  showToast(message: string, color: string) {
    return (
      '<div id="showToast" class="showToast" role="alert" aria-live="assertive" aria-atomic="true" style="position: fixed; top: 20px; right: 20px; max-width: 400px; z-index: 9999;">' +
      '<div class="toast-header alert-' +
      color +
      '" style="border-radius: 5px;">' +
      '<span class="mb-0 text-white font-size-40">' +
      message +
      ' </span>' +
      '<button type="button" class="close ml-3" data-dismiss="toast" aria-label="Close">' +
      '<i class="fas fa-times text-white font-size-40" aria-hidden="true"></i>' +
      '</button>' +
      '</div>' +
      '</div>'
    );
  }
}
