import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class StatService {
  dictFileSizeUnits: any = { tb: "TB", gb: "GB", mb: "MB", kb: "KB", b: "b" }
  filesizeBase: number = 1000;

  constructor(private datePipe: DatePipe) { }

  

  getBestStat(array: Array<any>, total: number){
    console.log(total);
    let result = Object.values(array.reduce((c:any, {accountNo, firstName, lastName, customerId, transAmount}: any) => {
      c[accountNo] = c[accountNo] || {accountNo, firstName, lastName, customerId, percent: 0, transAmount: 0};      
      c[accountNo].transAmount += Number(transAmount);
      c[accountNo].percent = Number(c[accountNo].transAmount)/total * 100;
      return c;
    }, {}));
    //result.sort((a:any, b:any) =>  b - a);
    console.log(result.sort((a:any, b:any) =>  b?.transAmount - a?.transAmount));
    return result.sort((a:any, b:any) =>  b?.transAmount - a?.transAmount);
  }

  getFilesize(size: number, html?: boolean) {
    var selectedSize = 0;
    var selectedUnit = "b";
    if (size > 0) {
      var units = ["tb", "gb", "mb", "kb", "b"];
      for (var i = 0; i < units.length; i++) {
        var unit = units[i];
        var cutoff = Math.pow(this.filesizeBase, 4 - i) / 10;
        if (size >= cutoff) {
          selectedSize = size / Math.pow(this.filesizeBase, 4 - i);
          selectedUnit = unit;
          break;
        }
      }
      selectedSize = Math.round(10 * selectedSize) / 10; // Cutting of digits
    }
    
    return html == true ? "<strong>".concat(selectedSize.toString(), "</strong> ").concat(this.dictFileSizeUnits[selectedUnit]) 
    : selectedSize.toString().concat(this.dictFileSizeUnits[selectedUnit]);
  }

  getDailyTransactions(record: Array<object>) {
    //Filter Today's transactions 
    const today = this.datePipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd');
    console.log(today);
    const data =  record.filter((d: any) => d.transDate == today);
    return data;
  }

  getMonthlyTransactions(record: Array<object>) {
    //Filter this month transactions
    const startOfMonth = moment().startOf('month').format();
    const endOfMonth = moment().endOf('month').format();
    const data = record.filter((m: any) => new Date(m.transDate + " " + m.time) >= new Date(startOfMonth) && new Date(m.transDate + " " + m.time) <= new Date(endOfMonth));
    console.log(data);
    return data;
  }

  getWeeklyTransactions(record: Array<object>) {
    const startOfWeek = moment().startOf('week').format();
    const endOfWeek = moment().endOf('week').format();
    const data = record.filter((w: any) => new Date(w.transDate + " " + w.time) >= new Date(startOfWeek) && new Date(w.transDate + " " + w.time) <= new Date(endOfWeek));
    console.log(data);
    return data;
  }

  getYesterdayTransactions(record: Array<object>) {
    console.log(record);
    const yesterday =  moment().subtract(1, 'days').format('YYYY-MM-DD');
    const data =  record.filter((d: any) => d.transDate == yesterday);   
    console.log(data);
    return data;
  }

  calculateTransactions(record: Array<object>) {
    //calculate the total savings per day
    const data = record.reduce((sum: any, current: any) => sum + Number(current.transAmount), 0);
    console.log(data);
    return data;
  }


  getMonthlyCustomers(record: Array<object>) {
    //Filter this month customers
    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
    const data = record.filter((m: any) => new Date(m.date_registered) >= new Date(startOfMonth) && new Date(m.date_registered) <= new Date(endOfMonth));
    console.log(data);
    return data;
  }
}
