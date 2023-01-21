import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ToastService } from './toast.service';

var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = pdfFonts.pdfMake.vfs;


@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  today = new Date();
  time = new Date().toLocaleTimeString();
  date = new Date().toLocaleDateString();
  timezone = new Date().toTimeString();
  thisYear = new Date().getFullYear();

  amountConvert: any;
  filename: any;
  path: any;
  pdfObj: any;
  receipt: any;
  logoData: any;
  subscription: any;

  constructor(
    public router: Router,
    private http: HttpClient,
    private toastService: ToastService
  ) { }


  toTitleCase(str: string) {
    return str.replace(
      /\w\S*/g,
      function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }


  convertToWords(response: any) {
    var converter = require('number-to-words');
    this.amountConvert = converter.toWords(response?.transAmount ? response?.transAmount : 0);
    this.toTitleCase(this.amountConvert);
    this.filename = response?.txref ? response?.txref : Date.now();
    this.path = `receipts/moloyal-receipt-${this.filename}.pdf`;
  }

  loadLocalAssetToBase64() {
    this.http.get(environment.logo, { responseType: 'blob' })
      .subscribe(res => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.logoData = reader.result;
          console.log(this.logoData);
        }
        reader.readAsDataURL(res);
      });
  }

  getTransType(transaction:any){
    if (transaction.source == "Withdrawal") {
      var getTransactionType = transaction?.withdrawalId == 1 ? ' by Cash' : ' to Bank';
    } else {
      var getTransactionType = " ";
    }
    return getTransactionType;
  }

  createPdf(transaction: any, agentdetails: any) {
    this.convertToWords(transaction);
    this.getTransType(transaction);
    const getTransType = this.getTransType(transaction);
    
    const getTransactionType = " ";

    const getTransType2 = transaction?.withdrawalId == 1 ? ' by Cash' : ' to Bank';

    const base64Image = "data:image/png;base64,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";
    //const base64Image2 = this.logoData;

    // I'm using ternary operator for the transaction reference incase no transaction reference from the backend.
    const gettime = Math.floor(100000000 + Math.random() * 900000000);

    const DocDefinition = {
      header: [{
        columns: [
          { text: this.date + ' ' + this.time, alignment: 'right', fontSize: 10 }
        ]
      }],
      footer: [
        {
          columns: [
            { text: 'Generated from MoLoyal Admin Portal', alignment: 'center', style: 'footer' },
          ]
        },
        {
          columns: [
            { text: 'Copyright MoLoyal Consulting Solutions ' + this.thisYear + '. All rights reserved.', alignment: 'center', style: 'footer' }
          ]
        }],
        // Let's specify the width for the image to scale proportionally

      content: [
        //{columns: [
          {image: base64Image, width: 150, alignment: 'center'},
      //]},
        {
          columns: [{ width: '100%', text: 'TRANSACTION RECEIPT', style: 'header', alignment: 'center' }],
        },
        {
          text: [
            {
              text: 'Customer Name: ',
              style: 'subheader',
              alignment: 'left'
            },
            {
              text: transaction?.accountName ? transaction?.accountName : this.toTitleCase(transaction?.firstName) + " " + this.toTitleCase(transaction?.lastName),
              style: 'anotherStyle',
            },
          ],
          margin: [0, 15, 0, 15]
        },
        {
          text: [
            {
              text: 'Customer Account Number: ',
              style: 'subheader',
              alignment: 'left'
            },
            {
              text: transaction?.accountNo,
              style: 'anotherStyle',
            },
          ],
          margin: [0, 15, 0, 15]
        },
        {
          text: [
            {
              text: 'Transaction Type: ',
              style: 'subheader',
              alignment: 'left'
            },
            {
              text: transaction?.source ? transaction?.source + getTransType : transaction?.transType + getTransType,
              style: 'anotherStyle',
            },
          ],
          margin: [0, 15, 0, 15]
        },
        {
          text: [
            {
              text: 'Transaction Amount: ',
              style: 'subheader',
              alignment: 'left'
            },
            {
              text: '₦' + parseFloat(transaction?.transAmount).toFixed(2),
              style: 'anotherStyle',
            },
          ],
          margin: [0, 15, 0, 15]
        },
        {
          text: [
            {
              text: 'Plan Name: ',
              style: 'subheader',
              alignment: 'left'
            },
            {
              text: transaction?.plan_name ? transaction?.plan_name : transaction?.plan,
              style: 'anotherStyle',
            },
          ],
          margin: [0, 15, 0, 15]
        },
        {
          text: [
            {
              text: 'Amount in words: ',
              style: 'subheader',
              alignment: 'left'
            },
            {
              text: this.toTitleCase(this.amountConvert) + ' Naira Only',
              style: 'anotherStyle',
            },
          ],
          margin: [0, 15, 0, 15]
        },
        {
          text: [
            {
              text: 'Transaction Date: ',
              style: 'subheader',
              alignment: 'left'
            },
            {
              text: transaction?.timestamp ? transaction?.timestamp + ' ' + transaction?.time : transaction?.transDate + ' ' + transaction?.time,
              style: 'anotherStyle',
            },
          ],
          margin: [0, 15, 0, 15]
        },
        {
          text: [
            {
              text: 'Transaction reference: ',
              style: 'subheader',
              alignment: 'left'
            },
            {
              text: transaction?.trxref ? transaction?.trxref : transaction?.transref,
              style: 'anotherStyle',
            },
          ],
          margin: [0, 15, 0, 15]
        },
        {
          text: [
            {
              text: 'Transaction Status: ',
              style: 'subheader',
              alignment: 'left'
            },
            {
              text: transaction?.status ? transaction?.status : "Successful",
              style: 'anotherStyle',
            },
          ],
          margin: [0, 15, 0, 15]
        },
        {
          text: [
            {
              text: 'Agent Name: ',
              style: 'subheader',
              alignment: 'left'
            },
            {
              text: transaction?.agent_firstname?.concat(' ').concat(transaction?.agent_lastname),
              style: 'anotherStyle',
            },
          ],
          margin: [0, 15, 0, 15]
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 15, 0, 0],
          background: '#00aeef',
          color: '#ffffff'
        },
        subheader: {
          //fontSize: 14,
          fontSize: 20,
          bold: true,
          color: '#ee383f',
          margin: [0, 15, 0, 0]
          // margin: [20, 0, 20, 0]
        },
        anotherStyle: {
          fontSize: 20,
          color: '#00aeef',
          margin: [0, 15, 0, 0]
        },
        footer: {
          color: '#737475',
          fontSize: 10,
        }
      }
    }

    this.pdfObj = pdfMake.createPdf(DocDefinition);
    //console.log(this.pdfObj);
  }

  getPdfName(response: any){
    this.filename = response?.transref ? response?.transref : Date.now();
    return this.path = `MoSave-receipt-${this.filename}.pdf`;
  }


  generatePdf(transaction: any, agentdetails: any) {
    this.createPdf(transaction, agentdetails);
    try {
      this.pdfObj.download(this.getPdfName(transaction));
      const title = "Success";
      const message = "Receipt downloaded";
      this.toastService.showSuccess(message, title);
    } catch (e){
      const title = "Error";
      const message = "Unable to download receipt";
      console.log(message);
      this.toastService.showError(message, title);
    }    
    
  }

  openPdf(transaction: any, agentdetails: any){
    this.createPdf(transaction, agentdetails);
    try {
      this.pdfObj.open();
      const title = "Success";
      const message = "Receipt opened";
      this.toastService.showSuccess(message, title);
    } catch (e){
      const title = "Error";
      const message = "Unable to open receipt";
      console.log(message);
      this.toastService.showError(message, title);
    }  
  }

  printPdf(transaction: any, agentdetails: any){
    this.createPdf(transaction, agentdetails);
    try {
      // open in same window
     // this.pdfObj.print({}, window);
      // open in new window
      this.pdfObj.print();
      const title = "Success";
      const message = "Receipt printed";
      this.toastService.showSuccess(message, title);
    } catch (e){
      const title = "Error";
      const message = "Unable to print receipt";
      console.log(message);
      this.toastService.showError(message, title);
    }  
  }

  viewPdf(transaction:any, agentdetails:any) {
    this.generatePdf(transaction, agentdetails);
  }




}
