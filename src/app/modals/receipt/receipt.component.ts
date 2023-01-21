import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.css']
})
export class ReceiptComponent implements OnInit {
  img = environment.mini_logo;
  @Input() customerId?: number;
  @Input() fullName?: string;
  @Input() firstName?: string;
  @Input() lastName?: string;
  @Input() transDate?: string;
  @Input() transType?: string;
  @Input() transref?: number;
  @Input() transAmount?: number;
  @Input() accountNo?: number;
  @Input() userId?: string;
  @Input() planName?: string;
  @Input() value?: string;
  @Input() content?: any;
  @Output() onOpenPdfContent: EventEmitter<any> = new EventEmitter();
  @Output() onPrintPdfContent: EventEmitter<any> = new EventEmitter();
  @Output() onModalClose: EventEmitter<any> = new EventEmitter();
  
  

  constructor() { }

  ngOnInit(): void {
  }

  openPdf(content:any){
    this.onOpenPdfContent?.emit(content);
  }

  printPdf(content:any){
    this.onPrintPdfContent?.emit(content);
  }

  modalDismiss(value:any){
    this.onModalClose?.emit(value);
  }



}
