import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatService {
  dictFileSizeUnits: any = { tb: "TB", gb: "GB", mb: "MB", kb: "KB", b: "b" }
  filesizeBase: number = 1000;

  constructor() { }

  

  getBestStat(array: Array<any>){
    let result = Object.values(array.reduce((c:any, {accountNo, firstName, lastName, customerId, transAmount}: any) => {
      c[accountNo] = c[accountNo] || {accountNo, firstName, lastName, customerId, percent: 0, transAmount: 0};
      c[accountNo].percent = Number(transAmount)/1000 * 100;
      c[accountNo].transAmount += Number(transAmount);
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
}
