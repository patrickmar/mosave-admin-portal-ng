import { Component, OnInit, ViewChild } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { ReceiptService } from 'src/app/services/receipt.service';

import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { DataTableDirective } from 'angular-datatables';
import { environment } from 'src/environments/environment';


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
  customerInfo!: any;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();
  public loading = false;
  public showComponent = false;

  @ViewChild(DataTableDirective, { static: false })
  datatableElement: any = DataTableDirective;
  emptyTable = environment.emptyTable;

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
    this.getCustomerDetails();
    this.tableConfig(this.customerInfo);
    this.getCustomerTrxs();
    this.download();
    this.receiptService.loadLocalAssetToBase64();
    this.receiptService.convertToWords(this.allRecords);
  }

  tableConfig(data: any) {
    var self = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 20,
      processing: true,
      language: {
        zeroRecords: `<div class="text-center p-4">
            <img class="mb-3" src="${this.emptyTable}" alt="Image Description" style="width: 10rem;" data-hs-theme-appearance="default">
          <p class="mb-0">No data to show</p>
          </div>`,
        paginate: {
          next: 'Next',
          previous: 'Prev',
          first: '<i class="bi bi-skip-backward"></i>',
          last: '<i class="bi bi-skip-forward"></i>'
        },
      },
      lengthMenu: [10, 15, 20],
      dom: 'Bfrtip',
      buttons: [
        {
          extend: 'copy',
          className: 'd-none'
        },
        {
          extend: 'print',
          className: 'd-none'
        },
        {
          extend: 'excel',
          className: 'd-none',
          filename: () => {
            return 'trnx_statement_' + self.customerInfo?.[0]?.firstName + '-' + self.customerInfo?.[0]?.lastName + '_' + new Date().getTime();
          },
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5, 6]
          }
        },
        {
          extend: 'csv',
          className: 'd-none',
          filename: () => {
            return 'trnx_statement_' + self.customerInfo?.[0]?.firstName + '-' + self.customerInfo?.[0]?.lastName + '_' + new Date().getTime();
          },
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5, 6]
          }
        },
        {
          extend: 'pdf',
          className: 'd-none',
          filename: () => {
            return 'trnx_statement_' + self.customerInfo?.[0]?.firstName + '-' + self.customerInfo?.[0]?.lastName + '_' + new Date().getTime();
          },
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5, 6]
          }
        },
      ],
      info: true,
      lengthChange: true,
    };
  }

  getCustomerId() {
    this.customerId = this.route.snapshot.paramMap.get('sn');
    console.log(this.customerId);
  }
  getCustomerDetails() {
    this.dataService.getCustomerProfile(this.customerId).subscribe((result: any) => {
      console.log(result);
      this.customerInfo = result;
    }), (error: any) => {
      console.log(error);
    }
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  getCustomerTrxs() {
    console.log(this.customerId);
    try {
      this.loading = true;
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
      this.loading = false;
      this.showComponent = true;
      this.dtTrigger.next('');
    }), (error: any) => {
      console.log(error);
      this.loading = false;
      this.toastService.showError('Error fetching customer transactions', 'Error');  
    }
  } catch (error) {
    this.loading = false; 
    this.toastService.showError('Error fetching data', 'Error');     
  }

  }

  getCustomerTotalBalances() {
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
      console.log(this.commissionSum);
    }), (error: any) => {
      console.log(error);
    }

  }

  getUserDetails() {
    this.authservice.userData$.subscribe((response: any) => {
      this.user = response;
    });
  }

  viewReceipt(record: any) {
    this.receiptService.viewPdf(record, this.user);
  }

  convertNum(number: any) {
    return Number(number);
  }

  download() {
    $('#export-excel').on('click', () => {
      $('.buttons-excel').click();
      //$(".buttons-excel").trigger("click");
      // $("#datatable").DataTable().button('.buttons-excel').trigger();
    });
    $('#export-print').on('click', () => {
      $('.buttons-print').click();
    });
    $('#export-csv').on('click', () => {
      $('.buttons-csv').click();
    });
    $('#export-pdf').on('click', () => {
      $('.buttons-pdf').click();
    });
    $('#export-copy').on('click', () => {
      $('.buttons-copy').click();
    });
  }

}
