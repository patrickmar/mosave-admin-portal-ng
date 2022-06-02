import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
declare var HSSideNav:any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  logo = environment.logo;
  logo2 = environment.logo2;
  logo3 = environment.logo3;
  mini_logo = environment.mini_logo;
  isLoggedIn$!: Observable<boolean>;


  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    window.onload = function () {

    // INITIALIZATION OF NAVBAR VERTICAL ASIDE
      // =======================================================
      new HSSideNav('.js-navbar-vertical-aside').init();
    }

    this.isLoggedIn$ = this.authService.isLoggedIn;
  }

}
