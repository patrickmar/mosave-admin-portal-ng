import { state } from '@angular/animations';
import { TitleCasePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { FunctionsService } from 'src/app/services/functions.service';
import { StatService } from 'src/app/services/stat.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
declare var HSBsDropdown: any;
declare var HSCore: any;
declare var HSStickyBlock: any;
declare var bootstrap: any;
declare var HSScrollspy: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
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
  allBanks: Array<any> | any;
  showOtpComponent = true;
  otpLength!: number;
  otpLength2!: number;
  otpLength3!: number;
  otpLength4!: number;
  otpLength5!: number;
  userRole!: Array<any>;
  setFiles: Array<any> = [];
  files: File[] = [];
  maxFileSize: number = 1000000;
  imagePath = environment.app.baseUrl + environment.app.imagePath;
  profile: any;
  profileId: any;
  public loading2 = false;
  public showComponent = false;
  spinner: boolean = false;
  verifiedAcctName!: string;
  error: boolean = false;
  response: any;
  fullName!: string;
  genders = this.functionService.genders;
  roles = [
    {
      id: 1,
      role: 'Agent',
    },
    {
      id: 2,
      role: 'Supervisor',
    },
    {
      id: 3,
      role: 'Admin',
    },
    {
      id: 4,
      role: 'SuperAdmin',
    },
  ];

  @ViewChild('ngOtpInput', { static: false }) ngOtpInput: any;
  config = {
    allowNumbersOnly: true,
    length: 4,
    isPasswordInput: true,
    disableAutoFocus: true,
    placeholder: '',
    inputStyles: {
      width: '50px',
      height: '50px',
    },
  };

  constructor(
    private authservice: AuthService,
    private toastService: ToastService,
    private dataService: DataService,
    private authService: AuthService,
    private statService: StatService,
    private functionService: FunctionsService
  ) {}

  ngOnInit(): void {
    this.jsInit();
    this.getUserDetails();
    this.getAllBanks();
    this.getAdminProfile();
    this.profileForm = new FormGroup({
      firstname: new FormControl(this.user?.firstname, Validators.required),
      lastname: new FormControl(this.user?.lastname, Validators.required),
      phone: new FormControl(this.user?.phone, Validators.required),
      role: new FormControl(
        { value: this.userRole[0].role, disabled: true },
        Validators.required
      ),
      city: new FormControl(this.user?.city, Validators.required),
      state: new FormControl(this.user?.state, Validators.required),
      country: new FormControl(this.user?.country, Validators.required),
      address: new FormControl(this.user?.address, Validators.required),

      email: new FormControl(this.user?.email, Validators.required),
      accountNo: new FormControl(this.user?.accountNo, Validators.required),
      accountName: new FormControl(this.user?.accountName, Validators.required),
      birthdate: new FormControl(this.user?.birthdate, Validators.required),
      gender: new FormControl(this.user?.gender, Validators.required),
      bank: new FormControl(this.user?.bank, Validators.required),
      bankcode: new FormControl(this.user?.bankcode, Validators.required),
      bvn: new FormControl(this.user?.bvn, Validators.required),
    });
    this.emailForm = new FormGroup({
      email: new FormControl(
        { value: this.user?.email, disabled: true },
        Validators.required
      ),
    });

    this.changePasswordForm = new FormGroup({
      currentPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', Validators.required),
      confirmNewPassword: new FormControl('', Validators.required),
    });
  }

  getAdminProfile() {
    try {
      this.loading2 = true;
      forkJoin([this.dataService.getAdminProfile(this.user.sn)]).subscribe(
        (res: any) => {
          this.profile = res[0].data;
          this.fullName = this.profile.firstName + ' ' + this.profile.lastName;
          this.loading2 = false;
          this.showComponent = true;
          //var titlecase = new TitleCasePipe();
          // let form = {
          //   firstname: titlecase.transform(this.profile?.firstName),
          //   lastname: titlecase.transform(this.profile?.lastName),
          //   accountName: titlecase.transform(this.fullName),
          //   accountTypeId: this.profile?.accountTypeId,
          //   account_num: this.profile?.account_num,
          // };
          // this.profileForm.patchValue(form);
        }
      );
    } catch (error) {
      this.loading2 = false;
      this.toastService.showError('Could not fetch profile', 'Error');
    }
  }

  getAllBanks() {
    this.dataService.getAllBanks().subscribe((res: any) => {
      if (res.status == true) {
        this.allBanks = res.data;
      } else {
        this.allBanks = null;
      }
    });
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

  getUserDetails() {
    this.authservice.userData$.subscribe((response: any) => {
      this.user = response;
      this.userRole = this.roles.filter(
        (i: any) => i.id === Number(this.user.level)
      );
    });
  }

  update() {
    this.loading = true;
    this.dataService.updateAgentProfile(this.profileForm.value).subscribe(
      (result: any) => {
        this.loading = false;
        this.response = result;
        if (this.response.error == false) {
          this.toastService.showSuccess(this.response.message, 'Success');
        } else {
          this.toastService.showError(this.response.message, 'Error');
        }
      },
      (error: any) => {
        this.loading = false;
        console.log(error);
        this.toastService.showError('Error: Something went wrong', 'Error');
      }
    );
  }

  changeEmail() {
    console.log(this.emailForm.value);
  }

  changePassword(): void {
    const form = this.changePasswordForm.value;
    if (form.newPassword == form.confirmNewPassword) {
      const PasswordData = {
        agentid: this.user.phone,
        oldpassword: form.currentPassword,
        newpassword: form.newPassword,
      };
      this.loading = true;
      this.dataService.changeAgentPassword(PasswordData).subscribe(
        (res: any) => {
          if (res.error == false) {
            this.loading = false;
            this.toastService.showSuccess(res.message, 'Success');
            this.authService.logout();
          } else {
            this.loading = false;
            this.toastService.showError(res.message, 'Error');
          }
        },
        (error: any) => {
          this.loading = false;
          console.log(error, 'Error');
          this.toastService.showError('Error: something went wrong', 'Error');
        }
      );
    } else {
      this.toastService.showError('Error: Passwords not the same', 'Error');
    }
  }

  setPin() {
    if (this.otp == this.otp2) {
      const pinData = {
        pin: this.otp,
        agentid: this.user.sn,
      };
      this.loading = true;
      this.dataService
        .createTransactionPin(pinData)
        .subscribe((result: any) => {
          this.loading = false;
          if (result.pinbool) {
            this.toastService.showSuccess(result.message, 'Success');
          } else {
            this.toastService.showError('Error: ', 'Error');
          }
        }),
        (error: any) => {
          this.loading = false;
          this.toastService.showError('Error: Something went wrong', 'Error');
        };
    } else {
      this.toastService.showError('Pin not same', 'Error');
    }
  }

  changePin() {
    const pinData1 = {
      pin: this.otp3,
      agentid: this.user.sn,
    };
    if (this.otp3 != null) {
      if (this.otp4 == this.otp5) {
        const pinData2 = {
          newpin: this.otp4,
          agentphone: this.user.phone,
        };
        this.loading = true;
        this.dataService
          .verifyTransactionPin(pinData1)
          .subscribe((result: any) => {
            if (result.verified == 1) {
              this.dataService
                .resetAgentPin(pinData2)
                .subscribe((result: any) => {
                  this.loading = false;
                  if (result.pinbool == true) {
                    this.toastService.showSuccess(result.response, 'Success');
                  } else {
                    this.toastService.showError(result.message, 'Error');
                  }
                }),
                (error: any) => {
                  this.loading = false;
                  this.toastService.showError(
                    'Error: Something went wrong',
                    'Error'
                  );
                };
            } else {
              this.loading = false;
              this.toastService.showError(result.message, 'Error');
            }
          });
      } else {
        this.toastService.showError('Pin not same', 'Error');
      }
    } else {
      this.toastService.showError('Please enter your current pin', 'Error');
    }
  }

  onSelect(e: any) {
    if (e.target.files.length > 0) {
      var regex = /(\.jpg|\.jpeg|\.svg|\.pdf|\.gif|\.png)$/i;
      const doc = e.target.files[0];
      if (!regex.exec(doc.name)) {
        this.toastService.showError(
          'Accepted file format is (.png, .jpg, .jpeg, .pdf)',
          'Error'
        );
      } else if (doc.size > 1000000) {
        this.toastService.showError(
          'Maximum of ' +
            this.statService.getFilesize(this.maxFileSize, false) +
            ' file size is allowed',
          'Error'
        );
      } else {
        this.setFiles.length = 0;
        this.files.length = 0;
        const doe = [...this.setFiles];
        this.files.push(...e.target.files);
        this.functionService
          .getBase64(doc)
          .then((result: any) => {
            doc['base64'] = result;
            doe.push({ file: doc, base64URL: result });
            this.setFiles = doe;
          })
          .catch((err: any) => {
            console.log(err);
          });
      }
    } else {
      this.toastService.showError('Please upload a valid image', 'Error');
    }
  }

  async updateImage() {
    if (this.setFiles.length > 0) {
      const formData = new FormData();
      const fileName =
        new Date().getTime() + '' + Math.floor(Math.random() * 10000) + '.png';
      const response = await fetch(this.setFiles[0].file.base64);
      const blob = await response.blob();
      formData.append('photo', blob, fileName);
      const data: any = {
        adminId: this.user.sn,
      };
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });
      try {
        this.loading = true;
        this.dataService.updateAdminPicture(formData).subscribe(
          (res: any) => {
            this.response = res;
            this.loading = false;
            if (res.error == false) {
              this.profile.img = this.response.path;
              this.deleteImage();
              this.toastService.showSuccess(res.message, 'success');
            } else {
              this.toastService.showError(res.message, 'Error');
            }
          },
          (error: any) => {
            this.loading = false;
            this.toastService.showError(error.message, 'Error');
          }
        );
      } catch (error) {
        this.loading = false;
        console.log(error);
        this.toastService.showError(
          'Please check your internet and try again later',
          'Error'
        );
      }
    } else {
      this.toastService.showError('Please upload Image', 'Error');
    }
  }

  deleteImage() {
    this.setFiles.length = 0;
    this.files.length = 0;
  }

  verifyAccount(event: any) {
    let accountNo: string = event.target.value;
    // Ensure the input is more than 10 before carrying out the request
    if (accountNo.length == 10) {
      this.spinner = true;
      this.getBankCode();
      const bankCode = this.profileForm?.get('bankcode')?.value; // this.getBankCode();
      if (bankCode === '') {
        this.toastService.showError('Please select a bank', 'Error');
      } else {
        let value = 'account_number=' + accountNo + '&bank_code=' + bankCode;
        try {
          this.dataService.verifyBankAccount(value).subscribe(
            (res: any) => {
              this.spinner = false;
              if (res.status == true) {
                this.error = false;
                this.verifiedAcctName = res.data.account_name;
                this.profileForm
                  ?.get('accountName')
                  ?.setValue(res.data.account_name);
              } else {
                this.error = true;
                this.verifiedAcctName = res.error.message;
                this.profileForm.get('accountName')?.setValue('');
                this.toastService.showError(res.error.message, 'Error');
              }
            },
            (error: any) => {
              this.spinner = false;
              this.error = true;
              this.verifiedAcctName = error.error.message;
              this.profileForm?.get('accountName')?.setValue('');
              this.toastService.showError(error.error.message, 'Error');
            }
          );
        } catch (error) {
          console.log(error);
        }
      }
    }
  }

  getBankCode() {
    let bankCode = this.profileForm.get('bankcode')?.value;
    if (bankCode == '') {
      this.toastService.showError('Please select Bank', 'Error');
    } else {
      var match = this.allBanks.filter(function (obj: any) {
        return obj.code == bankCode;
      });
      this.profileForm.get('bank')?.setValue(match[0].name);
      return match[0];
    }
  }

  jsInit() {
    window.onload = function () {
      // INITIALIZATION OF BOOTSTRAP DROPDOWN
      // =======================================================
      HSBsDropdown.init();

      // INITIALIZATION OF INPUT MASK
      // =======================================================
      HSCore.components.HSMask.init('.js-input-mask');

      // INITIALIZATION OF STICKY BLOCKS
      // =======================================================
      new HSStickyBlock('.js-sticky-block', {
        targetSelector: document
          .getElementById('header')
          ?.classList.contains('navbar-fixed')
          ? '#header'
          : null,
      });

      // SCROLLSPY
      // =======================================================
      new bootstrap.ScrollSpy(document.body, {
        target: '#navbarSettings',
        offset: 100,
      });

      new HSScrollspy('#navbarVerticalNavMenu', {
        breakpoint: 'lg',
        scrollOffset: -20,
      });

      // INITIALIZATION OF SELECT
      // =======================================================
      HSCore.components.HSTomSelect.init('.js-select');
    };
  }
}
