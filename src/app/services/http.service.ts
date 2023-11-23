import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  loadingElement: any;
  isLoading = false;
  dismiss: any;

  errorHandler(error: HttpErrorResponse) {
    // return Observable.throw(error.message || "server error.");
    return throwError(error.message || error);
  }

  constructor(private http: HttpClient) {}
  post(serviceName: string, data: any) {
    const headers = new HttpHeaders();
    const options = { headers: headers, withCredentials: false };
    const url = environment.app.baseUrl + environment.app.path + serviceName;
    //console.log(url);

    // this.dismiss = this.loadingService.isLoading == false ? this.dismissLoader() : true;
    return this.http.post(url, JSON.stringify(data), options).pipe(
      finalize(() => {
        //this.dismissLoader;
      })
    );
    //return this.http.post(url, JSON.stringify(data), options).pipe(catchError(this.errorHandler));
  }

  postWithImage(serviceName: string, data: any) {
    const headers = new HttpHeaders();
    const options = { headers: headers, withCredentials: false };
    const url = environment.app.baseUrl + environment.app.path + serviceName;
    return this.http.post(url, data, options).pipe(finalize(() => {}));
  }

  postWithImageOnMoticketCoUk(serviceName: string, data: any) {
    const headers = new HttpHeaders();
    const options = { headers: headers, withCredentials: false };
    const url = environment.app1.baseUrl + environment.app1.path + serviceName;
    console.log(url);
    return this.http.post(url, data, options).pipe(finalize(() => {}));
  }

  get(serviceName: string) {
    const headers = new HttpHeaders();
    const options = { headers: headers, withCredentials: false };
    const url = environment.app.baseUrl + environment.app.path + serviceName;
    //return this.http.get(url, options).pipe(catchError(this.errorHandler));
    return this.http.get(url, options).pipe(
      finalize(() => {
        //this.dismissLoader();
      })
    );
  }

  getPaystack(serviceName: string) {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + environment.paystack.secretKey,
    });
    const options = { headers: headers, withCredentials: false };
    const url = environment.paystack.url + serviceName;
    return this.http.get(url, options).pipe(finalize(() => {}));
  }

  getCountries() {
    const headers = new HttpHeaders();
    const options = { headers: headers, withCredentials: false };
    const url = environment.countries.url;
    return this.http.get(url, options).pipe(finalize(() => {}));
  }

  postExternal(serviceName: string, data: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const options = { headers: headers, withCredentials: false };
    const url = environment.countries.state + serviceName;
    const JsonData = JSON.stringify(data);
    return this.http.post(url, JsonData, options).pipe(finalize(() => {}));
  }
}
