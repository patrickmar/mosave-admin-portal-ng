import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'moloyal-admin-portal';
  user: any;
  isLoggedIn$!: Observable<boolean>;

  constructor(
    private authService: AuthService) {}

     ngOnInit(): void {
      this.getUserDetails();
      this.isLoggedIn$ = this.authService.isLoggedIn;
     }

  getUserDetails(){
    this.authService.userData$.subscribe((response: any) => {
      this.user = response;
    });
  }
}
