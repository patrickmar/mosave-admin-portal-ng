import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { ToastService } from 'src/app/services/toast.service';
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
  sideMenu!: any


  constructor(private authService: AuthService, private dataService: DataService,
    private toastService: ToastService) { }

  ngOnInit(): void {
    this.getPageMenu();
    window.onload = function () {

    // INITIALIZATION OF NAVBAR VERTICAL ASIDE
      // =======================================================
      new HSSideNav('.js-navbar-vertical-aside').init();
    }

    this.isLoggedIn$ = this.authService.isLoggedIn;
  }

  getPageMenu(){
    try {
      this.dataService.getPageMenu().subscribe((res)=>{
        this.sideMenu = res;
      })
    } catch (error) {
      this.toastService.showError('Please check your internet', 'Error');      
    }
    
  }

  externalURLs =[
    {id: 1, name: 'Call Support', url: 'tel:+2348188775534', icon: 'phone' },
    {id: 2, name: 'Email Support', url: 'mailto:support@moloyal.com', icon: 'mailbox' },
    {id: 3, name: 'WhatsApp Support', url: 'https://api.whatsapp.com/send/?phone=2348188775534&text=Hello+Moloyal', icon: 'whatsapp' }
    
  ]

}
