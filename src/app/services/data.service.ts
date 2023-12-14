import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  time = new Date().getTime();

  constructor(private httpService: HttpService, private http: HttpClient) {}

  readonly sampleTicket: string = './assets/json/tickets.json';
  readonly PageMenu: string = './assets/json/menu.json';

  // Get Data Bundle API call
  public getAllTickets2() {
    return this.http.get(this.sampleTicket);
  }

  // get page menus
  public getPageMenu() {
    return this.http.get(this.PageMenu);
  }

  //get request from paystack
  // Get Agent terms and conditions
  public getAllBanks() {
    return this.httpService.getPaystack('bank');
  }

  //verify customer Bank Accounts
  public verifyBankAccount(options: string) {
    return this.httpService.getPaystack('bank/resolve?' + options);
  }

  public getAllCountries() {
    return this.httpService.getCountries();
  }

  //get all Mosave Transfers on paystack
  public getAllTransfers(options: string) {
    return this.httpService.getPaystack('transfer?' + options);
  }

  //fetch all Mosave Transfers on paystack by customer Id
  public getCustomerTransferRecord(value: string) {
    return this.httpService.getPaystack('transfer/' + value);
  }

  // fet all Transfer Recipients
  public getTransferRecipients(options: string) {
    return this.httpService.getPaystack('transferrecipient?' + options);
  }

  // ALL GET REQUEST
  // get all mosave customers
  public getAllcustomers(): Observable<any> {
    return this.httpService.get('all/customers' + '?' + this.time);
  }

  //Get last 50 Customer Withdraw Transactions
  public getCustomersWithdrawTnxs(custid: number): Observable<any> {
    return this.httpService.get(
      'customerwithdrawhistory/' + custid + '?' + this.time
    );
  }

  //Get last 50 Customer Savings Transactions
  public getCustomersSavingsTnxs(custid: number): Observable<any> {
    return this.httpService.get(
      'customersavingshistory/' + custid + '?' + this.time
    );
  }

  //Get last 50 Customer commission Transactions
  public getCustomersCommissionTnxs(custid: number): Observable<any> {
    return this.httpService.get(
      'customercommissionhistory/' + custid + '?' + this.time
    );
  }

  //Get all Customer Transactions. The limit is 50
  public getAllCustomersTnxs(custid: number): Observable<any> {
    return this.httpService.get(
      'customertransactions/' + custid + '?' + this.time
    );
  }

  //Search Customer
  public searchCustomer(query: string): Observable<any> {
    return this.httpService.get('customer/search/' + query + '?' + this.time);
  }

  //Get Total Wallet Balance
  public getCustomerTotalBalance(custid: number): Observable<any> {
    return this.httpService.get(
      'customertotalbalance/' + custid + '?' + this.time
    );
  }

  //Get customer sum Savings, commission and Withdrawal
  public getCustomerTotalBalances(custid: number): Observable<any> {
    return this.httpService.get(
      'customer/sumtrans/' + custid + '?' + this.time
    );
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
  public getAgentProfile(agentid: number): Observable<any> {
    return this.httpService.get('agent/profile/' + agentid + '?' + this.time);
  }

  // Get  all transactions
  public getMosaveTransactions(): Observable<any> {
    return this.httpService.get('transactions/all' + '?' + this.time);
  }

  // filter  all transactions
  public filterMosaveTransactionsByDate(
    type: string,
    from: string,
    to: string
  ): Observable<any> {
    return this.httpService.get(
      'transactions/filter/' + type + '/' + from + '/' + to + '?' + this.time
    );
  }

  // - Get all savings transactions
  public getMosaveSavingTransactions(): Observable<any> {
    return this.httpService.get('savings/transactions' + '?' + this.time);
  }

  // Get request to display all savings plan
  public getCustomerSavingsPlans(customerId: any): Observable<any> {
    return this.httpService.get(
      'getcustomer_savingplans/' + customerId + '?' + this.time
    );
  }

  // Get request to display all savings plan
  public getAllSavingsPlans(customerId: any) {
    return this.httpService.get(
      'all/savings_plan/' + customerId + '?' + this.time
    );
  }

  // send OTP to customer API
  public sendOTP(customerId: any) {
    return this.httpService.get('otp/sender/' + customerId + '?' + this.time);
  }

  //Get agent daily transaction Balance API
  public agentdailybalance(agentid: any): Observable<any> {
    return this.httpService.get('agentdailytrans/' + agentid + '?' + this.time);
  }

  // Get Agent daily total savings balance
  public getAgentDailySavingsBalance(agentid: any): Observable<any> {
    return this.httpService.get(
      'agent/sumsavingstrans/' + agentid + '?' + this.time
    );
  }
  // Get Agent daily total withdraw balance
  public getAgentDailyWithdrawalBalance(agentid: any): Observable<any> {
    return this.httpService.get(
      'agent/sumwithtrans/' + agentid + '?' + this.time
    );
  }

  // Get all merchants
  public getAllMerchants() {
    return this.httpService.get('all/programmerchants');
  }

  // Get all merchants  - view all tickets - GET
  public getAllTickets() {
    return this.httpService.get('all/eventickets');
  }

  // Get all programs
  public getAllPrograms() {
    return this.httpService.get('all/programs');
  }

  //tickets/sold/:eventid', supply event id
  public getTicketsById(eventid: number) {
    return this.httpService.get('tickets/sold/' + eventid);
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
    return this.httpService.post('/admin/withdrawal', data);
  }

  // Post customer savings plan API
  public postCustomerSavingsPlan(savingsPlanData: any): Observable<any> {
    return this.httpService.post('post/customer_savings_plan', savingsPlanData);
  }

  // Verify Transaction PIN API
  verifyTransactionPin(checkPin: any): Observable<any> {
    return this.httpService.post('agent/verifypin', checkPin);
  }

  // Create Transaction PIN API
  createTransactionPin(pin: any): Observable<any> {
    return this.httpService.post('agent/recievepin', pin);
  }

  // Change Transaction PIN API
  changeTransactionPin(pin: any): Observable<any> {
    return this.httpService.post('agent/changepin', pin);
  }

  // reset agent password  API
  resetAgentPin(agentPINData: any): Observable<any> {
    return this.httpService.post('agent/resetpin', agentPINData);
  }

  // forgot agent PIN  API
  forgotAgentPin(agentPinData: any): Observable<any> {
    return this.httpService.post('agent/forgotpin', agentPinData);
  }

  // change agent password  API
  changeAgentPassword(agentPasswordData: any): Observable<any> {
    return this.httpService.post('agent/changepass', agentPasswordData);
  }

  // Update agent profile  API
  updateCustomerProfile(customerData: any): Observable<any> {
    return this.httpService.post('user/update', customerData);
  }

  // Upload Agent Profile Picture API
  uploadProfilePicture(imageData: any): Observable<any> {
    return this.httpService.post('agent/updatepics', imageData);
  }

  // Update Customer Profile Picture API
  updateCustomerPicture(imageData: any): Observable<any> {
    return this.httpService.postWithImage('customer/updatepics', imageData);
  }

  // Update agent profile  API
  updateAgentProfile(agentData: any): Observable<any> {
    return this.httpService.post('agent/update', agentData);
  }

  // Update Customer Profile Picture API
  updateAdminPicture(imageData: any): Observable<any> {
    return this.httpService.postWithImage('admin/updatepics', imageData);
  }

  // fetch admin profile
  getAdminProfile(adminId: any): Observable<any> {
    return this.httpService.get('admin/profile/' + adminId);
  }

  // fetch customer lifecycle
  customerLifecycle(): Observable<any> {
    return this.httpService.get('customer/lifecycle');
  }

  // create event ticket
  createEventTicket(data: any): Observable<any> {
    //const api = 'create/eventticket';
    return this.httpService.postWithImage('create/eventticket', data);
  }

  createEventTicket2(data: any): Observable<any> {
    //const api = 'create/eventticket';
    return this.httpService.postWithImageOnMoticketCoUk('tickets', data);
  }

  createEventTickets(data: any): Observable<any> {
    return forkJoin([
      this.createEventTicket(data),
      this.createEventTicket2(data),
    ]);
  }

  // create merchant
  createMerchant(data: any): Observable<any> {
    return this.httpService.postWithImage('create/merchant', data);
  }

  // create program
  createProgram(data: any): Observable<any> {
    return this.httpService.postWithImage('create/program', data);
  }

  // - POST- supply eventid
  deleteEventTicket(data: any): Observable<any> {
    return this.httpService.post('delete/eventticket', data);
  }

  // - POST - supply eventid including all other params
  updateEventTicket(data: any): Observable<any> {
    return this.httpService.postWithImage('update/eventticket', data);
  }

  // - POST - supply eventid including all other params
  deleteEventTicketImg(data: any): Observable<any> {
    return this.httpService.postWithImage('delete/eventticket_img', data);
  }

  //fetch all states by country
  fetchStatesByCountry(data: any) {
    return this.httpService.postExternal('states', data);
  }
}
