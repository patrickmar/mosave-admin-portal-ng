import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-transactions-header',
  templateUrl: './transactions-header.component.html',
  styleUrls: ['./transactions-header.component.css']
})
export class TransactionsHeaderComponent implements OnInit {
  //@Input() dateId!: number;
  @Input() id!: number;
  @Input() tableName!: string;
  @Input() header!: Array<any>;
  @Input() event!: any;
  @Input() ranges!: Array<string>;
  @Input() dateRanges!: Array<any>;
  @Output() onRender: EventEmitter<any> = new EventEmitter();
  @Output() onDownloadCopy: EventEmitter<any> = new EventEmitter();
  @Output() onDownloadPrint: EventEmitter<any> = new EventEmitter();
  @Output() onDownloadExcel: EventEmitter<any> = new EventEmitter();
  @Output() onDownloadCsv: EventEmitter<any> = new EventEmitter();
  @Output() onDownloadPdf: EventEmitter<any> = new EventEmitter();
  @Output() onShowColumn: EventEmitter<any> = new EventEmitter();
  @Output() onFilterDate: EventEmitter<any> = new EventEmitter();
  @Output() onSetCount: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  rerender(value:any){
    this.onRender?.emit(value);
  }
  downloadCopy(value:any){
    this.onDownloadCopy?.emit(value);
  }
  downloadPrint(value:any){
    this.onDownloadPrint?.emit(value);
  }
  downloadExcel(value:any){
    this.onDownloadExcel?.emit(value); 
  }
  downloadCsv(value:any){
    this.onDownloadCsv?.emit(value);
  }
  downloadPdf(value:any){
    this.onDownloadPdf?.emit(value);
  }
  showColumn(value:any, number: number){
    this.onShowColumn?.emit({value: value, id: number});
  }
  filterDate(start:any, end:any, timeline: string, id: number, tableName: string){
    const value = {start, end, timeline, id, tableName}
    this.onFilterDate?.emit(value);
  }

  getMaxCount(value: number){
    this.onSetCount?.emit(value);
  }

  convertNum(value: string){
    return Number(value);
  }

}
