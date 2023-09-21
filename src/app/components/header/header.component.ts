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
declare var HSFormSearch: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  logo = environment.logo;
  logo2 = environment.logo2;
  logo3 = environment.logo3;
  mini_logo = environment.mini_logo;
  imagePath = environment.app.baseUrl + environment.app.imagePath;
  user: any;
  profile: any;
  firstname!: string;
  isLoggedIn$!: Observable<boolean>;
  userRole: any;
  loading: boolean = false;
  searchResult: Array<any> = [];
  recentSearches: Array<any> = [];
  noRecord: boolean = false;
  avatar = environment.avatar;
  searchForm!: FormGroup;
  emptyTable = environment.emptyTable;
  roles = [
    {
      id: 1,
      role: 'Agent',
    },
    {
      id: 2,
      role: 'Supervisor',
    },
    {
      id: 3,
      role: 'Admin',
    },
    {
      id: 4,
      role: 'SuperAdmin',
    },
  ];

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private dataService: DataService,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUserDetails();
    this.getRecentSearches();
    this.jsInit();
    this.isLoggedIn$ = this.authService.isLoggedIn;
    this.searchForm = new FormGroup({
      searchQuery: new FormControl(''),
    });
  }

  jsInit() {
    window.onload = function () {
      // new HSFormSearch('.js-form-search');
      const HSFormSearchInstance = new HSFormSearch('.js-form-search');
      if (HSFormSearchInstance.collection.length) {
        HSFormSearchInstance.getItem(1).on('close', function (el: any) {
          el.classList.remove('top-0');
        });

        document
          .querySelector('.js-form-search-mobile-toggle')
          ?.addEventListener('click', (e: any) => {
            //const el = e.currentTarget as HTMLInputElement
            let dataOptions = JSON.parse(
                e.currentTarget?.getAttribute('data-hs-form-search-options')
              ),
              $menu = document.querySelector(dataOptions.dropMenuElement);
            $menu.classList.add('top-0');
            $menu.style.left = 0;
          });
      }
    };
  }

  openClose(open: any) {
    if (open) {
      $('#clearSearchResultsIcon').css({ display: 'block' });
    } else {
      $('#clearSearchResultsIcon').css({ display: 'none' });
    }
  }

  clearText() {
    $('#searchField').val('');
  }

  getUserDetails() {
    this.authService.userData$.subscribe((response: any) => {
      this.user = response;
      var titleCasePipe = new TitleCasePipe();
      this.firstname = titleCasePipe.transform(this.user?.firstname);
      this.userRole = this.roles.filter(
        (i: any) => i.id === Number(this.user.level)
      );
      if (this.user.sn) {
        this.getAdminProfile(this.user.sn);
      }
    });
  }

  getAdminProfile(sn: string) {
    try {
      this.loading = true;
      this.dataService.getAdminProfile(sn).subscribe((res: any) => {
        this.profile = res.data;
      });
    } catch (error) {
      this.loading = false;
      this.toastService.showError('Could not fetch profile', 'Error');
    }
  }

  getRecentSearches() {
    this.storageService.get('search').then((resp) => {
      if (resp != false) {
        this.recentSearches = resp;
      }
    });
  }

  searchCustomer(event: any) {
    let query = event.target.value;
    this.search(query);
  }

  search(query: string) {
    if (query.length > 2) {
      try {
        this.loading = true;
        this.noRecord = false;
        this.dataService.searchCustomer(query).subscribe(
          (res: any) => {
            this.loading = false;
            if (res.customer.length > 0) {
              this.searchResult = res.customer;
            } else {
              this.searchResult = [];
              this.noRecord = true;
            }

            if (query.length > 3) {
              this.storageService.get('search').then((resp) => {
                const oldSearch = resp == false ? [] : resp;
                const value = [query];
                const allSearch = [...oldSearch, ...value];
                this.storageService.store('search', allSearch);
              });
            }
            query.length == 0;
          },
          (error: any) => {
            this.loading = false;
            this.toastService.showError('Error: Something went wrong', 'Error');
          }
        );
      } catch (error) {
        console.log(error);
        this.loading = false;
        this.toastService.showError('Error: Please try again', 'Error');
      }
    }
  }

  Paste(val: any) {
    this.searchForm.get('searchQuery')?.setValue(val);
    this.search(val);
  }

  goToPage(sn: number) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/customer', sn, 'details']);
  }

  logoutAction() {
    this.authService.logout();
  }
}
