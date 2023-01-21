import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { ReceiptService } from 'src/app/services/receipt.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { createPopper } from '@popperjs/core';
import { transcode } from 'buffer';
import { TitleCasePipe } from '@angular/common';

declare var HSSideNav: any;
declare var HSFormSearch: any;
declare var HSBsDropdown: any;
declare var HsNavScroller: any;
declare var HSStickyBlock: any;
declare var HSCore: any;

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  savingsForm!: FormGroup;
  withdrawalForm!: FormGroup;
  updateProfileForm!: FormGroup;
  PlanForm!: FormGroup;
  customerId!: any;
  customer: any;
  user: any;
  fullName!: string;
  response: any;
  customerTrxs: any;
  test!: Array<any>;
  modalContent!: object | any;
  transactionValues!: object | any;
  plans!: Array<any> | any;
  imagePath = environment.app.baseUrl + environment.app.imagePath;
  loading: boolean = false;
  userPlans!: Array<any>;
  addInfo!: Array<any>;
  plansInfo!: Array<any> | any;
  pinData!: object;

  otp!: string;
  data: any;
  showOtpComponent = true;
  otpLength: any;

  @ViewChild('ngOtpInput', { static: false }) ngOtpInput: any;
  config = {
    allowNumbersOnly: true,
    length: 4,
    isPasswordInput: true,
    disableAutoFocus: false,
    placeholder: '',
    inputStyles: {
      'width': '50px',
      'height': '50px'
    }
  };

  networks = [
    {id: 1, name: '9MOBILE'},
    {id: 2, name: 'AIRTEL'},
    {id: 3, name: 'GLO'},
    {id: 4, name: 'MTN'}
  ]

  genders = [
    {id: 1, name: 'Female'},
    {id: 2, name: 'Male'},
  ]

  setVal(val: string) {
    this.ngOtpInput.setValue(val);
  }

  constructor(private route: ActivatedRoute, private dataService: DataService,
    private authservice: AuthService, private toastService: ToastService,
    private receiptService: ReceiptService, private modalService: NgbModal) {
    this.jsInit();
    this.getAddPlanInfo();
    this.getCustomerId();
    this.getCustomerDetails();
    this.getUserDetails();
    this.getCustomerTrxs();
    this.getCustomerPlans();
    this.getSavingPlans();
    console.log(this.user);
    console.log(this.customer);
  }

  ngOnInit(): void {

    this.savingsForm = new FormGroup({
      accountName: new FormControl(this.fullName, Validators.required),
      firstname: new FormControl(this.customer?.firstName, Validators.required),
      lastname: new FormControl(this.customer?.lastName, Validators.required),
      account_num: new FormControl(this.customer?.account_num, Validators.required),
      customerId: new FormControl(this.customerId, Validators.required),
      accountTypeId: new FormControl(this.customer?.accountTypeId, Validators.required),
      agentId: new FormControl(this.user.sn, Validators.required),
      planId: new FormControl(parseInt(''), Validators.required),
      terms: new FormControl(true, Validators.pattern('true')),
      planName: new FormControl(''),
      transAmount: new FormControl('', Validators.compose([
        Validators.maxLength(10),
        Validators.minLength(2),
        Validators.min(50),
        Validators.required
      ])),
      source: new FormControl('Savings')
    });

    this.withdrawalForm = new FormGroup({
      accountName: new FormControl(this.fullName, Validators.required),
      firstname: new FormControl(this.customer?.firstName, Validators.required),
      lastname: new FormControl(this.customer?.lastName, Validators.required),
      account_num: new FormControl(this.customer?.account_num, Validators.required),
      customerId: new FormControl(this.customerId, Validators.required),
      accountTypeId: new FormControl(this.customer?.account_typeId, Validators.required),
      agentId: new FormControl(this.user.sn, Validators.required),
      planId: new FormControl(parseInt(''), Validators.required),
      terms: new FormControl(true, Validators.pattern('true')),
      planName: new FormControl(''),
      transAmount: new FormControl('', Validators.compose([
        Validators.maxLength(10),
        Validators.minLength(2),
        Validators.min(50),
        Validators.required
      ])),
      source: new FormControl('Withdrawal')
    });

    this.PlanForm = new FormGroup({
      plans: new FormControl(''),
      //plans: new FormArray([]),
    });

    console.log(this.customer);

    this.updateProfileForm = new FormGroup({
      email: new FormControl('', Validators.required),
      firstName: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      userId: new FormControl('', Validators.required),
      mname: new FormControl( ''),
      BVN_num: new FormControl(''),
      city: new FormControl(''),
      country: new FormControl(''),
      dateOfBirth : new FormControl(''),
      mobilenetwork: new FormControl(''),
      state: new FormControl(''),
      street1: new FormControl(''), 
      
      customerId: new FormControl(this.customerId, Validators.required),
      agentId: new FormControl(this.user.sn, Validators.required),
      terms: new FormControl(true, Validators.pattern('true')),
      source: new FormControl('Profile'),
    });

    //this.getCustomerPlans(this.customerId);
  }

  getUserDetails() {
    this.authservice.userData$.subscribe((response: any) => {
      console.log(response);
      this.user = response;
      console.log(this.user.sn);
    });
  }

  getCustomerId() {
    this.customerId = this.route.snapshot.paramMap.get('sn');
    console.log(this.customerId);
  }

  getCustomerPlans() {
    console.log(this.customerId);
    this.dataService.getCustomerSavingsPlans(this.customerId).subscribe((res: any) => {
      console.log(res);
      //this.isLoading = false;
      this.userPlans = res;
    })
  }

  getCustomerDetails() {
    forkJoin([
      this.dataService.getCustomerProfile(this.customerId)
    ]).subscribe((res: any) => {
      console.log(res[0]);
      this.customer = res[0][0];
      console.log(this.customer);
      this.fullName = this.customer.firstName + ' ' + this.customer.lastName;
      console.log(this.fullName);
      var titlecase = new TitleCasePipe;
      this.savingsForm.get('firstname')?.setValue(titlecase.transform(this.customer?.firstName));
      this.savingsForm.get('lastname')?.setValue(titlecase.transform(this.customer?.lastName));
      this.savingsForm.get('accountName')?.setValue(titlecase.transform(this.fullName));
      this.savingsForm.get('accountTypeId')?.setValue(this.customer?.accountTypeId);
      this.savingsForm.get('account_num')?.setValue(this.customer?.account_num);
      this.withdrawalForm.get('firstname')?.setValue(titlecase.transform(this.customer?.firstName));
      this.withdrawalForm.get('lastname')?.setValue(titlecase.transform(this.customer?.lastName));
      this.withdrawalForm.get('accountName')?.setValue(titlecase.transform(this.fullName));
      this.withdrawalForm.get('accountTypeId')?.setValue(this.customer?.accountTypeId);
      this.withdrawalForm.get('account_num')?.setValue(this.customer?.account_num);
      this.getDetailsForProfileUpdate(this.customer);
    });

  }

  getDetailsForProfileUpdate(customer: any){
    var titlecase = new TitleCasePipe;
      this.updateProfileForm.get('firstName')?.setValue(titlecase.transform(customer?.firstName));
      this.updateProfileForm.get('lastName')?.setValue(titlecase.transform(customer?.lastName));
      this.updateProfileForm.get('mname')?.setValue(titlecase.transform(customer?.mname));
      this.updateProfileForm.get('email')?.setValue(customer?.email);
      this.updateProfileForm.get('userId')?.setValue(customer?.userId);
      this.updateProfileForm.get('BVN_num')?.setValue(customer?.BVN_num);
      this.updateProfileForm.get('gender')?.setValue(customer?.gender);
      this.updateProfileForm.get('mobilenetwork')?.setValue(customer?.mobilenetwork);
      this.updateProfileForm.get('dateOfBirth')?.setValue(new Date(customer?.dateOfBirth).toISOString().substr(0, 10));
      this.updateProfileForm.get('city')?.setValue(titlecase.transform(customer?.city));
      this.updateProfileForm.get('street1')?.setValue(titlecase.transform(customer?.street1));
      this.updateProfileForm.get('state')?.setValue(titlecase.transform(customer?.state));
      this.updateProfileForm.get('country')?.setValue(customer?.country);
      
  }


  getAddPlanInfo() {
    // this.plans= [
    //   {
    //     sn: 1,
    //     plan_id: 1,
    //     amount: 200,
    //     plan_name: 'Starter',
    //     days: 30,
    //     commission: 200,
    //     plan_duration: 'Monthly'
    //   },
    //   {
    //     sn: 2,
    //     plan_id: 2,
    //     amount: 500,
    //     plan_name: 'Basic',
    //     days: 30,
    //     commission: 500,
    //     plan_duration: 'Monthly'
    //   },
    //   {
    //     sn: 3,
    //     plan_id: 3,
    //     amount: 1000,
    //     plan_name: 'Premium',
    //     days: 30,
    //     commission: 500,
    //     plan_duration: 'Monthly'
    //   },
    //   {
    //     sn: 4,
    //     plan_id: 4,
    //     amount: 'Any Amount',
    //     plan_name: 'Any Amount',
    //     days: 30,
    //     commission: 500,
    //     plan_duration: 'Monthly'
    //   }
    // ]

    this.addInfo = [
      {
        id: 1,
        commission: 500,
        icon: 'gift-outline',
        cardColor: 'light-blue',
        plan_duration: 'Monthly'
      },
      {
        id: 2,
        commission: 500,
        icon: 'gift-outline',
        cardColor: 'light-red',
        plan_duration: 'Monthly'
      },
      {
        id: 3,
        commission: 200,
        icon: 'gift-outline',
        cardColor: 'light-green',
        plan_duration: 'Monthly'
      },
      {
        id: 4,
        commission: 500,
        icon: 'gift-outline',
        cardColor: 'light-soft-green',
        plan_duration: 'Monthly'
      },
    ];

    console.log(this.addInfo);
  }

  onOtpChange(otp: any) {
    this.otp = otp;
    this.otpLength = this.otp.length;
    console.log(this.otp);
    console.log(this.otpLength);
  }

  performTransaction(form: any, otp: string) {
    console.log(form);
    if (form.source == "Savings") {
      if (this.savingsForm.valid) {
        this.addSavings(otp);
      } else {
        this.toastService.showError('Savings form not valid', 'Error');
      }
    } else if (form.source == "Withdrawal") {
      if (this.withdrawalForm.valid) {
        this.Withdrawal(otp);
      } else {
        this.toastService.showError('Withdrawal form not valid', 'Error');
      }
    }else if(form.source === "Profile") {
      if (this.updateProfileForm.valid) {
        this.updateUser();
      } else {
        this.toastService.showError('Withdrawal form not valid', 'Error');
      }
    }

  }

  addSavings(otp: string) {
    this.loading = true;
    this.getSelectedPlan(this.savingsForm);
    console.log(this.savingsForm.value);
    const pinData = {
      pin: otp,
      agentid: this.user.sn,
    }
    console.log(pinData);
    this.dataService.verifyTransactionPin(pinData).subscribe((result: any) => {
      console.log(result);
      this.response = result;
      if (this.response.verified == 1) {
        this.dataService.savingsTransaction(this.savingsForm.value).subscribe((res: any) => {
          console.log(res);
          this.response = res;
          this.loading = false;
          if (this.response.error == false) {
            //success response
            this.toastService.showSuccess(this.response.message, 'Success');
            this.modalService.dismissAll();
          } else {
            //show error message
            this.toastService.showError(this.response.message, 'Error');
            //this.openErrorModal();
          }
        }), (error: any) => {
          this.loading = false;
          console.log(error);
          this.toastService.showError('Error: Something went wrong', 'Error');
        }
      } else {
        this.loading = false;
        this.toastService.showError(result.message, 'Error');
      }

    })

  }

  Withdrawal(otp: string) {
    this.loading = true;
    this.getSelectedPlan(this.withdrawalForm);
    console.log(this.withdrawalForm.value);
    if (this.user.level == 3 || this.user.level == 4) {
      this.dataService.withdrawalwithoutOtp(this.withdrawalForm.value).subscribe((res: any) => {
        console.log(res);
        this.response = res;
        this.loading = false;
        if (this.response.error == false) {
          //success response
          this.toastService.showSuccess(this.response.message, 'Success');
          this.modalService.dismissAll();
        } else {
          //show error message
          this.toastService.showError(this.response.message, 'Error');
          //this.openErrorModal();
        }

      }), (error: any) => {
        this.loading = false;
        console.log(error);
        this.toastService.showError('Error: Something went wrong', 'Error');
      }
    } else {
      const pinData = {
        pin: otp,
        agentid: this.user.sn,
      }
      console.log(pinData);
      this.dataService.verifyTransactionPin(pinData).subscribe((result: any) => {
        console.log(result);
        this.response = result;
        if (this.response.verified == 1) {
          this.dataService.withdrawalwithOtp(this.withdrawalForm.value).subscribe((res: any) => {
            console.log(res);
            this.response = res;
            this.loading = false;
            if (this.response.error == false) {
              this.toastService.showSuccess(this.response.message, 'Success');
              //success response
              this.modalService.dismissAll();
            } else {
              //show error message
              this.toastService.showError(this.response.message, 'Error');
              //this.openErrorModal();
            }
          }), (error: any) => {
            this.loading = false;
            console.log(error);
            this.toastService.showError('Error: Something went wrong', 'Error');
          }
        } else {
          this.loading = false;
          this.toastService.showError(result.message, 'Error');
        }
      }), (error: any) => {
        this.loading = false;
        console.log(error);
        this.toastService.showError('Error: Something went wrong', 'Error');
      }

    }
  }

  getCustomerTrxs() {
    console.log(this.customerId);
    this.dataService.getAllCustomersTnxs(this.customerId).subscribe((result: any) => {
      console.log(result);
      if (Array.isArray(result)) {
        //get savings record
        let savings = result.filter((item: any) => item.transType === "S");
        //get Withdraw record
        let withdraw = result.filter((item: any) => item.transType === "W");

        const replaceStr = result.map((res: any) => {
          if (res.transType == "S") {
            var type = res.transType + "avings";
          } else if (res.transType == "W") {
            var type = res.transType + "ithdrawal";
          } else {
            var type = res.transType + "";
          }
          return { ...res, transType: type };
        })
        this.customerTrxs = replaceStr;
      } else {
        this.toastService.showError(result.message, 'Error');
        this.customerTrxs = [];
      }

    }), (error: any) => {
      console.log(error);
      this.toastService.showError(error, 'Error');
    }

  }

  getSavingPlans() {
    this.dataService.getAllSavingsPlans(this.customerId).subscribe((res: any) => {
      console.log(res);
      if (res.length > 0) {
        // let assignPlan = this.addInfo.filter((x: any) => x.id === 1);
        // console.log(assignPlan);
        let assignPlan = this.addInfo.map((item: any, i: any) => Object.assign({}, item, res[i]));
        console.log(assignPlan);
        this.plans = res.map((item: any, i: any) => Object.assign({}, item, assignPlan[i]));
        console.log(this.plans);

      } else {
        let msg = 'No saving plans available for customer';
        this.toastService.showSuccess(msg, 'Info');
        this.plans = res;
        this.plansInfo = msg;
        console.log(this.plansInfo);
      }

    }, (error: any) => {
      console.log(error);
      this.toastService.showError('Error: Could not fetch customer plans', 'Error');
    })
    //});
  }

  getSelectedPlan(form: any) {
    let planid = form.get("planId")?.value;
    var match = this.userPlans.filter(function (obj) {
      return obj.plan_id == planid;
    });
    form.get("planName")?.setValue(match[0].plan_name);
    form.get("planId")?.setValue(parseInt(planid));
    console.log(match[0].plan_name);
    console.log(parseInt(planid));
  }

  createPlan() {
    this.loading = true;
    console.log(this.PlanForm.value);
    // get the sn of the selected plans
    const selectedPlans: any[] = [];
    // this.PlanForm.value.plans.map((value: any, index: number) => {
    if (this.PlanForm.value) {
      let planid = this.PlanForm.get("plans")?.value;
      console.log(planid);
      console.log(this.plans);
      var match = this.plans.filter(function (obj: any) {
        return obj.sn == planid;
      });
      console.log(match);
      let amount = match[0].amount;
      console.log(amount);
      selectedPlans?.push({ 'planid': planid, 'amount': amount });
    } else {
      this.toastService.showError('Please select a plan', 'Error');
    }
    // });
    console.log(selectedPlans);
    var savingsParams = {
      savings_plan: selectedPlans,
      customerid: this.customerId
    }
    console.log(savingsParams);
    this.dataService.postCustomerSavingsPlan(savingsParams).subscribe((result: any) => {
      console.log(result);
      this.response = result;
      this.loading = false;
      if (this.response.error == false) {
        this.toastService.showSuccess(this.response.message, 'success');
      } else {
        this.toastService.showError(this.response.message, 'Error');
      }
    }, (error: any) => {
      this.loading = false;
      console.log(error);
      this.toastService.showError('Error: Something went wrong', 'Error');
    })
  }

  downloadReceipt(customerTrxs: any) {
    this.receiptService.viewPdf(customerTrxs, this.user);
  }

  printReceipt(customerTrxs: any) {
    this.receiptService.printPdf(customerTrxs, this.user);
  }

  openReceipt(customerTrxs: any) {
    this.receiptService.openPdf(customerTrxs, this.user);
  }

  open(content: any, tableRow: any) {
    console.log(content);
    console.log(tableRow);
    //this.modalContent = content;
    this.modalContent = tableRow;
    this.modalService.open(content);
  }

  enterPin(content: any, values: any) {
    console.log(content);
    console.log(values);
    this.transactionValues = values;
    this.otp = values;
    this.modalService.open(content);
  }

  checkNumber(value: any) {
    return typeof (value);
  }

  changeNumber(value: any) {
    return Number(value);
  }

  roundNumber(value: any) {
    return Math.round(value);
  }

  jsInit() {
    (function() {
      window.onload = function () {

        // INITIALIZATION OF NAVBAR VERTICAL ASIDE
        // =======================================================
        new HSSideNav('.js-navbar-vertical-aside').init()
  
  
        // INITIALIZATION OF FORM SEARCH
        // =======================================================
        new HSFormSearch('.js-form-search');
  
  
        // INITIALIZATION OF BOOTSTRAP DROPDOWN
        // =======================================================
        HSBsDropdown.init();
  
        // INITIALIZATION OF SELECT
        // =======================================================
        HSCore.components.HSTomSelect.init('.js-select');
  
  
        // INITIALIZATION OF NAV SCROLLER
        // =======================================================
        new HsNavScroller('.js-nav-scroller')
  
  
        // INITIALIZATION OF STICKY BLOCKS
        // =======================================================
        new HSStickyBlock('.js-sticky-block', {
          targetSelector: document.getElementById('header')?.classList.contains('navbar-fixed') ? '#header' : null
        })
      }
    })()
    
  }


  updateUser() {
    var values = this.updateProfileForm.value;
    console.log(values);
    const updateUserData = {
      firstname: values.firstName,
      lastname: values.lastName,
      email: values.email,
      id: values.customerId,
      phone: values.userId,
      dateOfBirth: values.dateOfBirth,
      gender: values?.gender,
      street1: values?.street1,
      city: values?.city,
      state: values?.state,
      country: values?.country,
      bvn: values?.BVN_num,
      mobilenetwork: values?.mobilenetwork,
      agentId: values?.agentId
      // bank: values?.bank,
      // accountNo: values.bankAccountNo,
      // accountName: values.bankAccountName,
  }

  console.log(updateUserData);
  this.loading = true;
      this.dataService.updateCustomerProfile(updateUserData).subscribe((result: any) => {
        console.log(result);
        this.response = result;
        if (this.response.error == false) {
          this.loading = false;
          this.toastService.showSuccess(this.response.message, 'Success');
          //this.modalService.dismissAll();
        } else {
          this.loading = false;
          this.toastService.showError(this.response.message, 'Error');
        }

      },(error: any) => {
        this.loading = false;
        console.log(error);        
        this.toastService.showError('Something went wrong', 'Error');
      });
    

  }

}
