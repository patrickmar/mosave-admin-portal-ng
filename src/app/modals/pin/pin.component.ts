import { Component, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-pin',
  templateUrl: './pin.component.html',
  styleUrls: ['./pin.component.css']
})
export class PinComponent implements OnInit {
  @Input() otp?: string;
  @Input() data?: any; 
  @Input() showOtpComponent?: boolean;
  @Input() otpLength?: any;
  @Input() loading?: boolean = false;
  @Input() config?: any;  
  @Input() value?: string;
  @Input() content?: string;
  @Input() event?: string;
  @Input() pinLength?: string;
  @Output() onSubmit: EventEmitter<any> = new EventEmitter();
  @Output() onPinChange: EventEmitter<any> = new EventEmitter();
  @Output() onModalClose: EventEmitter<any> = new EventEmitter();

  @ViewChild('ngOtpInput', { static: false }) ngOtpInput: any;

  constructor() { }

  ngOnInit(): void {
  }

  modalDismiss(value:any){
    this.onModalClose?.emit(value);
  }

  pinChange(value:any){
    this.onPinChange?.emit(value);
  }

  submit(value:any){
    this.onSubmit?.emit(value);
  }

}
