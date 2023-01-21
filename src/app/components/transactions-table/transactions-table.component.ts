import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  // selector: 'app-transactions-table', 
  selector: 'tr[app-transactions-table]',
  templateUrl: './transactions-table.component.html',
  styleUrls: ['./transactions-table.component.css']
})
export class TransactionsTableComponent implements OnInit {
  @Input() sn?: string;
  @Input() userId?: any;
  @Input() r?: any;
  @Input() customerId?: any; 
  @Input() firstName?: string;
  @Input() lastName?: any; 
  @Input() fullName?: any;  
  @Input() plan_name?: string;
  @Input() transAmount?: number;
  @Input() loading?: boolean = false;
  @Input() transref?: any;
  @Input() time?: string;
  @Input() content?: any;
  @Input() records?: Array<any>;
  @Input() transType?: string
  @Input() transDate?: string;
  @Input() agentFullName?: any;
  @Input() transDateConcat?: any;  
  @Input() athlete: any;
  @Output() onOpen: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  openModal(value:any, str: any){
    this.onOpen?.emit({value, str});
  }

}
