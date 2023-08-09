import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthConstants } from '../config/auth-constants';
import { HttpService } from './http.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userData$ = new BehaviorSubject<any>('');
  ForgotPasswordData$ = new BehaviorSubject<any>('');
  customerRecords = new BehaviorSubject<any>('');
  customers: any = [];
  private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private httpService: HttpService,
    private storageService: StorageService,
    private router: Router,

  ) { }

  get isLoggedIn() {
    return this.userData$.asObservable();
  }

  // get agent Data after login
  getUserData() {
    this.storageService.get(AuthConstants.AUTH).then(res => {
      //console.log(res);
      this.userData$.next(res);
    }) 
  }

  isUserLoggedin(){
    return this.storageService.checkValue(AuthConstants.AUTH);
  }

  // Post login API
  login(loginData: any): Observable<any> {
    return this.httpService.post('admin/login', loginData);
  }

  //Post agent Registration API

  register(signupData: any): Observable<any> {
    return this.httpService.post('admin/register', signupData);
  }

  //Post agent forgot password API for email
  forgotPassword(ForgotPasswordData: any): Observable<any> {
    return this.httpService.post('admin/forgotpass', ForgotPasswordData);
  }

  // logout user
  logout() {
    this.storageService.removeItem(AuthConstants.AUTH).then(res => {
      this.userData$.next('');
      this.router.navigate(['login']);
    })
  }


}
