import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { ReceiptService } from 'src/app/services/receipt.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { createPopper } from '@popperjs/core';

declare var HSSideNav: any;
declare var HSFormSearch: any;
declare var HSBsDropdown: any;
declare var HsNavScroller: any;
declare var HSStickyBlock: any;

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  savingsForm!: FormGroup;
  withdrawalForm!: FormGroup;
  customerId!: any;
  customer: any;
  user: any;
  fullName!: string;
  response: any;
  customerTrxs: any;
  test!: Array<any>;
  modalContent!: object | any;
  plans!: Array<any>;
  imagePath = environment.app.baseUrl + environment.app.imagePath;

  constructor(private route: ActivatedRoute, private dataService: DataService,
    private authservice: AuthService, private toastService: ToastService,
    private receiptService: ReceiptService, private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.jsInit();
    this.getAllPlans();
    this.getCustomerId();
    this.getCustomerDetails();
    this.getUserDetails();
    this.getCustomerTrxs();
    console.log(this.user);
    console.log(this.customer);

    this.savingsForm = new FormGroup({
      accountName: new FormControl({ value: this.fullName, ghf: '' }, Validators.required),
      firstname: new FormControl(this.customer?.firstName, Validators.required),
      lastname: new FormControl(this.customer?.lastName, Validators.required),
      account_num: new FormControl(this.customer?.account_num, Validators.required),
      customerId: new FormControl(this.customerId, Validators.required),
      accountTypeId: new FormControl(this.customer?.account_typeId, Validators.required),
      agentId: new FormControl(this.user.sn, Validators.required),
      planId: new FormControl('', Validators.required),
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
      planId: new FormControl('', Validators.required),
      planName: new FormControl(''),
      transAmount: new FormControl('', Validators.compose([
        Validators.maxLength(10),
        Validators.minLength(2),
        Validators.min(50),
        Validators.required
      ])),
      source: new FormControl('Withdrawal')
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

  getCustomerDetails() {
    forkJoin([
      this.dataService.getCustomerProfile(this.customerId)
    ]).subscribe((res: any) => {
      console.log(res[0]);
      this.customer = res[0][0];
      this.fullName = this.customer.firstName + ' ' + this.customer.lastName;
      console.log(this.fullName);
    })

  }

  getAllPlans(){
    this.plans= [
      {
        sn: 1,
        plan_id: 1,
        amount: 200,
        plan_name: 'Starter',
        days: 30,
        commission: 200,
        plan_duration: 'Monthly'
      },
      {
        sn: 2,
        plan_id: 2,
        amount: 500,
        plan_name: 'Basic',
        days: 30,
        commission: 500,
        plan_duration: 'Monthly'
      },
      {
        sn: 3,
        plan_id: 3,
        amount: 1000,
        plan_name: 'Premium',
        days: 30,
        commission: 500,
        plan_duration: 'Monthly'
      },
      {
        sn: 4,
        plan_id: 4,
        amount: 'Any Amount',
        plan_name: 'Any Amount',
        days: 30,
        commission: 500,
        plan_duration: 'Monthly'
      }
    ]

    console.log(this.plans);
  }

  AddSavings() {
    console.log(this.savingsForm.value);
    this.dataService.savingsTransaction(this.withdrawalForm.value).subscribe((res: any) => {
      console.log(res);
      this.response = res;
      if (this.response.error == false) {
        // this.loadingService.dismissLoading();
        this.toastService.showSuccess(this.response.message, 'Success');
        //success response
        //this.openSuccessModal();
      } else {
        // this.loadingService.dismissLoading();
        this.toastService.showError(this.response.message, 'Error');
        //show error message
        //this.openErrorModal();
      }

    }), (error: any) => {
      //this.loadingService.dismissLoading();
      console.log(error);
      this.toastService.showError('Error: Something went wrong', 'Error');
    }
  }

  Withdrawal() {
    console.log(this.withdrawalForm.value);
    if (this.user.role == 3 || this.user.role == 4) {
      this.dataService.withdrawalwithoutOtp(this.withdrawalForm.value).subscribe((res: any) => {
        console.log(res);
        this.response = res;
        if (this.response.error == false) {
          this.toastService.showSuccess(this.response.message, 'Success');
          // this.loadingService.dismissLoading();
          //success response
          //this.openSuccessModal();
        } else {
          // this.loadingService.dismissLoading();
          this.toastService.showError(this.response.message, 'Error');
          //show error message
          //this.openErrorModal();
        }

      }), (error: any) => {
        //this.loadingService.dismissLoading();
        console.log(error);
        this.toastService.showError('Error: Something went wrong', 'Error');
      }
    } else {
      this.dataService.withdrawalwithOtp(this.withdrawalForm.value).subscribe((res: any) => {
        console.log(res);
        this.response = res;
        if (this.response.error == false) {
          this.toastService.showSuccess(this.response.message, 'Success');
          // this.loadingService.dismissLoading();
          //success response
          //this.openSuccessModal();
        } else {
          // this.loadingService.dismissLoading();
          this.toastService.showError(this.response.message, 'Error');
          //show error message
          //this.openErrorModal();
        }

      }), (error: any) => {
        //this.loadingService.dismissLoading();
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

  checkNumber(value: any){
    return typeof(value);
  }

  jsInit() {
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


      // INITIALIZATION OF NAV SCROLLER
      // =======================================================
      new HsNavScroller('.js-nav-scroller')


      // INITIALIZATION OF STICKY BLOCKS
      // =======================================================
      new HSStickyBlock('.js-sticky-block', {
        targetSelector: document.getElementById('header')?.classList.contains('navbar-fixed') ? '#header' : null
      })
    }
  }

}
