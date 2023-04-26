import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
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
  loading: boolean = false;
  searchResult: Array<any> = [];
  recentSearches: Array<any> = [];
  noRecord: boolean = false;;
  avatar = environment.avatar;
  searchForm!: FormGroup;
  emptyTable = environment.emptyTable;
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

  constructor(private authService: AuthService, private toastService: ToastService,
    private dataService: DataService, private storageService: StorageService, private router: Router) { }

  ngOnInit(): void {
    this.getUserDetails();
    this.getRecentSearches();
    this.jsInit();
    this.isLoggedIn$ = this.authService.isLoggedIn;  
    this.searchForm = new FormGroup({
      searchQuery: new FormControl('')
    }) 
  }

  jsInit(){
    window.onload = function () {
    new HSFormSearch('.js-form-search');
    }
  }

  getUserDetails(){
    this.authService.userData$.subscribe((response: any) => {
      this.user = response;
      var titleCasePipe = new TitleCasePipe();
      this.firstname = titleCasePipe.transform(this.user?.firstname);
      this.userRole = this.roles.filter((i: any) => i.id === Number(this.user.level));
      console.log(this.userRole);
    });
  }

  getRecentSearches(){
    this.storageService.get('search').then(resp => {
      console.log(this.recentSearches);
      if(resp != false){
        this.recentSearches = resp;        
      }
      
    })
  }

  searchCustomer(event: any) {
    let query = event.target.value;
    this.search(query);
  }

  search(query: string){
    if(query.length > 2){     
      try {
        this.loading = true;
        this.noRecord = false;
        this.dataService.searchCustomer(query).subscribe((res: any) => {
          console.log(res);
          this.loading = false;
          if(res.customer.length > 0){
            this.searchResult = res.customer;
          }else {
            this.searchResult = [];
            this.noRecord = true;
          }
          
          if(query.length > 3){ 
           this.storageService.get('search').then(resp => {
            console.log(resp);
            const oldSearch = resp == false ? [] : resp;
            console.log(oldSearch);
            const value =  [query];
            const allSearch = [...oldSearch, ...value];
            console.log(allSearch);
            this.storageService.store('search', allSearch);
           });
           
          }
        },(error: any)=> {
          console.log(error)
          this.loading = false;
          this.toastService.showError('Error: Something went wrong', 'Error');
        });
        
      } catch (error) {
        console.log(error);
        this.loading = false;
        this.toastService.showError('Error: Please try again', 'Error');       
        
      }
    }
  }

  Paste(val: any){
    this.searchForm.get('searchQuery')?.setValue(val);
    this.search(val);
  }

  goToPage(sn: number) {
    console.log(this.router.url);
    // if (this.router.url === '/customer/'+sn+'/details') {
      this.router.routeReuseStrategy.shouldReuseRoute = function () {
        return false;
      };
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate(['/customer', sn, 'details']);
    //  }
    }

  logoutAction(){
    this.authService.logout();
    }

}
