import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';
import { UserDataResolver } from './resolvers/userData.resolvers';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DateAgoPipe } from './pipes/date-ago.pipe';
import { CustomersComponent } from './pages/customers/customers.component';
import { EditCustomerComponent } from './modals/edit-customer/edit-customer.component';
import { TransactionHistoryComponent } from './pages/transaction-history/transaction-history.component';
import { RegisterCustomerComponent } from './pages/register-customer/register-customer.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { DetailsComponent } from './pages/customers/details/details.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { ReceiptComponent } from './modals/receipt/receipt.component';
import { AuthGuard } from './guards/auth.guard';
import { NonAuthGuard } from './guards/non-auth.guard';
import { FormCheckService } from './services/form-check.service';

// import { Chart } from 'chart.js';
// let myChart = new Chart(new CanvasRenderingContext2D());

const appRoutes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: "login", component: LoginComponent, canActivate:[NonAuthGuard]},
  {path: "register", component: RegisterComponent},
  {path: "dashboard", component: DashboardComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard] },
  {path: "customers", component: CustomersComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "customer/register", component: RegisterCustomerComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard] },
  {path: "customer/:sn/trans-history", component: TransactionHistoryComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "customer/:sn/details", component: DetailsComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "profile", component: ProfileComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "transactions", component: TransactionsComponent, resolve:{userData: UserDataResolver}},
  {path: "page-not-found", component: PageNotFoundComponent},
  { path: '**', redirectTo: 'page-not-found'},
]

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    DashboardComponent,
    LoginComponent,
    RegisterComponent,
    SidebarComponent,
    DateAgoPipe,
    CustomersComponent,
    EditCustomerComponent,
    TransactionHistoryComponent,
    RegisterCustomerComponent,
    ProfileComponent,
    DetailsComponent,
    TransactionsComponent,
    PageNotFoundComponent,
    ReceiptComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule, 
    HttpClientModule,
    NgbModalModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    RouterModule.forRoot(appRoutes, {enableTracing: false, anchorScrolling: 'enabled'})
  ],
  providers: [DatePipe, FormCheckService],
  bootstrap: [AppComponent]
})
export class AppModule { }
