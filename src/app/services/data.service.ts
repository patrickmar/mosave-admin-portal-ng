import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  time = new Date().getTime();

  constructor(private httpService: HttpService) { }

  // ALL GET REQUEST

  // get all mosave customers
  public getAllcustomers(): Observable<any> {
    return this.httpService.get('all/customers' + '?' + new Date().getTime());
  }

  //Get last 50 Customer Withdraw Transactions
  public getCustomersWithdrawTnxs(custid: number): Observable<any> {
    return this.httpService.get('customerwithdrawhistory/' + custid + '?' + this.time);
  }

  //Get last 50 Customer Savings Transactions 
  public getCustomersSavingsTnxs(custid: number): Observable<any> {
    return this.httpService.get('customersavingshistory/' + custid + '?' + this.time);
  }

  //Get all Customer Transactions. The limit is 50
  public getAllCustomersTnxs(custid: number): Observable<any> {
    return this.httpService.get('customertransactions/' + custid + '?' + this.time);
  }

  //Search Customer
  public searchCustomer(query: string): Observable<any> {
    return this.httpService.get('customer/search/' + query + '?' + this.time);
  }

  //Get Total Wallet Balance
  public getCustomerTotalBalance(custid: number): Observable<any> {
    return this.httpService.get('customertotalbalance/' + custid + '?' + this.time);
  }

  //Get customer sum Savings, commission and Withdrawal
  public getCustomerTotalBalances(custid: number): Observable<any> {
    return this.httpService.get('customer/sumtrans/' + custid + '?' + this.time);
  }

  //Get full customer profile
  public getCustomerProfile(custid: number): Observable<any> {
    return this.httpService.get('customer/profile/' + custid + '?' + this.time);
  }

  // Get Total active Customers (Customers who had already started saving)
  public getTotalActiveCustomers(): Observable<any> {
    return this.httpService.get('totalactive/customers' + '?' + this.time);
  }

  // Get agent details API where i can parse an agentId to fetch the full details of an agent.
  public getCustomerTransactions(agentid: number): Observable<any> {
    return this.httpService.get('agent/profile/' + agentid + '?' + this.time);
  }

  // Get  all transactions
  public getMosaveTransactions(): Observable<any> {
    return this.httpService.get('transactions/all' + '?' + this.time);
  }

  // - Get all savings transactions
  public getMosaveSavingTransactions(): Observable<any> {
    return this.httpService.get('savings/transactions' + '?' + this.time);
  }




  // ALL POST REQUEST
  // Post Customer Registration API
  registerCustomer(signupData: any): Observable<any> {
    return this.httpService.post('customer/register', signupData);
  }

  // --POST  savings 
  savingsTransaction(data: any): Observable<any> {
    return this.httpService.post('/admin/savings', data);
  }

  //withdrawals with otp
  withdrawalwithOtp(data: object): Observable<any> {
    return this.httpService.post('/admin/otpwithdrawal', data);
  }

  //without otp admin/withdrawal
  withdrawalwithoutOtp(data: object): Observable<any> {
    return this.httpService.post('/admin/otpwithdrawal', data);
  }

}
