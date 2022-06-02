import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { ReceiptService } from 'src/app/services/receipt.service';

import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';


@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css']
})
export class TransactionHistoryComponent implements OnInit {
  records!: Array<any>;
  recordsExist: boolean = false;
  user: any;
  allRecords: any;
  savingsRecords: any;
  withdrawalRecords: any;
  customerId!: any;
  totalSum!: number;
  savingsSum!: string;
  withdrawalSum!: any;
  commissionSum!: any;
  

  constructor(private dataService: DataService,
    private authservice: AuthService,
    private receiptService: ReceiptService,
    private route: ActivatedRoute,
    private toastService: ToastService) {
      this.getUserDetails();
      this.getCustomerId();
      this.getCustomerTotalBalances();
     }

  ngOnInit(): void {
    this.getCustomerTrxs();
    this.receiptService.loadLocalAssetToBase64();
    this.receiptService.convertToWords(this.allRecords);
  }

  getCustomerId(){
    this.customerId = this.route.snapshot.paramMap.get('sn');
    console.log(this.customerId);
  }

  getCustomerTrxs(){ 
    console.log(this.customerId);
    forkJoin([
    this.dataService.getAllCustomersTnxs(this.customerId), 
    this.dataService.getCustomersSavingsTnxs(this.customerId), 
    this.dataService.getCustomersWithdrawTnxs(this.customerId)
  ]).subscribe((result: any) => {
    console.log(result[0]);
    console.log(result[1]);
    console.log(result[2]);
    this.allRecords = result[0];
    this.savingsRecords = result[1];
    this.withdrawalRecords = result[2];
  }), (error: any) => { 
    console.log(error);
  }

  }

  getCustomerTotalBalances(){ 
    console.log(this.customerId);
    forkJoin([
    this.dataService.getCustomerTotalBalance(this.customerId), 
    this.dataService.getCustomerTotalBalances(this.customerId),
  ]).subscribe((result: any) => {
    console.log(result[0]);
    console.log(result[1]);
    this.totalSum = result[0];
    this.savingsSum = result[1][0][0]?.savings_sum;
    this.withdrawalSum = result[1][1][0]?.withdraw_sum;
    this.commissionSum = result[1][2][0]?.commission_sum;
    console.log(this.savingsSum);
    console.log(this.withdrawalSum);
    console.log(this.commissionSum );
  }), (error: any) => {  
    console.log(error);
  }

  }

  getUserDetails(){
    this.authservice.userData$.subscribe((response: any) => {
      this.user = response;
    });
  }

  viewReceipt(record:any){
    this.receiptService.viewPdf(record, this.user);
  }

  

}
