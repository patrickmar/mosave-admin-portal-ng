import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
declare var HSFormSearch:any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  logo = environment.logo;
  logo2 = environment.logo2;
  logo3 = environment.logo3;
  mini_logo = environment.mini_logo;
  user: any;
  firstname!: string;
  isLoggedIn$!: Observable<boolean>; 
  userRole: any; 
  roles = [
    {
      id: 1,
      role: "Agent"
    },
    {
      id: 2,
      role: "Supervisor"
    },
    {
      id: 3,
      role: "Admin"
    },
    {
      id: 4,
      role: "SuperAdmin"
    },
  ]  

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.getUserDetails();
    this.jsInit();
    this.isLoggedIn$ = this.authService.isLoggedIn;   
  }

  jsInit(){
    window.onload = function () {
    new HSFormSearch('.js-form-search');
    }
  }

  getUserDetails(){
    this.authService.userData$.subscribe((response: any) => {
      console.log(response);
      this.user = response;
      var titleCasePipe = new TitleCasePipe();
      this.firstname = titleCasePipe.transform(this.user?.firstname);
      console.log(this.user.sn);
      console.log(this.roles);
      this.userRole = this.roles.filter((i: any) => i.id === Number(this.user.level));
      console.log(this.userRole);
    });
  }

  logoutAction(){
    this.authService.logout();
    }

}
