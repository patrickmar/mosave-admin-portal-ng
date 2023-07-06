import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DataTablesModule } from 'angular-datatables';
import { NgOtpInputModule } from 'ng-otp-input';
import { ClipboardModule } from 'ngx-clipboard';
import { NgbModalModule, NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxLoadingModule, ngxLoadingAnimationTypes } from "ngx-loading";
import { QuillModule } from 'ngx-quill';

import { DatePipe, DecimalPipe, JsonPipe, TitleCasePipe } from '@angular/common';
import { UserDataResolver } from './resolvers/userData.resolvers';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DateAgoPipe } from './pipes/date-ago.pipe';
import { TimeAgoPipe } from 'time-ago-pipe'
import { CustomersComponent } from './pages/customers/customers.component';
import { EditCustomerComponent } from './modals/edit-customer/edit-customer.component';
import { TransactionHistoryComponent } from './pages/transaction-history/transaction-history.component';
import { RegisterCustomerComponent } from './pages/register-customer/register-customer.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { DetailsComponent } from './pages/customers/details/details.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { ReceiptComponent } from './modals/receipt/receipt.component';
import { AuthGuard } from './guards/auth.guard';
import { NonAuthGuard } from './guards/non-auth.guard';
import { FormCheckService } from './services/form-check.service';
import { PinComponent } from './modals/pin/pin.component';
import { TransactionsTableComponent } from './components/transactions-table/transactions-table.component';
import { TransactionsHeaderComponent } from './components/transactions-header/transactions-header.component';
import { TransactionsFooterComponent } from './components/transactions-footer/transactions-footer.component';
import { CreateComponent } from './pages/ticketing/create/create.component';
import { UpdateComponent } from './pages/ticketing/update/update.component';
import { ViewComponent } from './pages/ticketing/view/view.component';
import { TicketDetailsComponent } from './pages/ticketing/details/details.component';
import { ListingComponent } from './pages/transfers/listing/listing.component';
import { RecipientsComponent } from './pages/transfers/recipients/recipients.component';
import { TransferDetailsComponent } from './pages/transfers/transfer-details/transfer-details.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgChartsModule } from 'ng2-charts';
import { OverviewComponent } from './pages/transactions/overview/overview.component';
import { ProgramComponent } from './pages/programs/program/program.component';
import { ChartComponent } from './components/chart/chart.component';
import { ViewProgramComponent } from './pages/programs/view-program/view-program.component';
import { CreateProgramComponent } from './pages/programs/create-program/create-program.component';
import { ShowHidePasswordComponent } from './components/show-hide-password/show-hide-password.component';
import { UpdateProgramComponent } from './pages/programs/update-program/update-program.component';
import { ShortNumberPipe } from './pipes/short-number.pipe';
import { CountUpDirective } from './directives/count-up.directive';
import { StepsComponent } from './components/steps/steps.component';
import { CreateCustomerComponent } from './pages/customers/create-customer/create-customer.component';
import { StepTemplateComponent } from './components/step-template/step-template.component';
import { CompletePageComponent } from './components/complete-page/complete-page.component';
//import { ClipboardModule } from 'ngx-clipboard';


// import { Chart } from 'chart.js';
// let myChart = new Chart(new CanvasRenderingContext2D());



const appRoutes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: "login", component: LoginComponent, canActivate:[NonAuthGuard]},
  {path: "register", component: RegisterComponent},
  {path: "dashboard", component: DashboardComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard] },
  {path: "customers", component: CustomersComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "customer/register", component: RegisterCustomerComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard] },
  {path: 'create-customer', component: CreateCustomerComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: 'complete', component: CompletePageComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "customer/:sn/trans-history", component: TransactionHistoryComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "customer/:sn/details", component: DetailsComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "profile", component: ProfileComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "transactions/:type", component: TransactionsComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "ticket/create", component: CreateComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "ticket/view", component: ViewComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "ticket/:sn/update", component: UpdateComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "ticket/:sn/details", component: TicketDetailsComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "transfers/listing", component: ListingComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "transfers/recipients", component: RecipientsComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "transfers/:id/details", component: TransferDetailsComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "overview", component: OverviewComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "programs/create/:type", component: CreateProgramComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "programs/view/:type", component: ViewProgramComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "programs/update/:id/:type", component: UpdateProgramComponent, resolve:{userData: UserDataResolver}, canActivate:[AuthGuard]},
  {path: "page-not-found", component: PageNotFoundComponent},
  { path: '**', redirectTo: 'page-not-found'},
]

const Primary = '#dd0031';
const Secondary = '#1976d2';
const tertiary = '#ffffff';

const appLoader = {
  animationType: ngxLoadingAnimationTypes.circle, //threeBounce, circle, cubeGrid, pulse, rectangleBounce, rotatingPlane, wanderingCubes, doubleBounce, chasingDots, circleSwish,
  backdropBackgroundColour: 'rgba(0, 0, 0, 0.3)',
  backdropBorderRadius: '3px',
  primaryColour: Primary,
  secondaryColour: Secondary,
  tertiaryColour: tertiary,
  fullScreenBackdrop: false,
}

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
    //TimeAgoPipe,
    CustomersComponent,
    EditCustomerComponent,
    TransactionHistoryComponent,
    RegisterCustomerComponent,
    ProfileComponent,
    DetailsComponent,
    TransactionsComponent,
    PageNotFoundComponent,
    ReceiptComponent,
    PinComponent,
    TransactionsTableComponent,
    TransactionsHeaderComponent,
    TransactionsFooterComponent,
    CreateComponent,
    UpdateComponent,
    ViewComponent,
    TicketDetailsComponent,
    ListingComponent,
    RecipientsComponent,
    TransferDetailsComponent,
    OverviewComponent,
    ProgramComponent,
    ChartComponent,
    ViewProgramComponent,
    CreateProgramComponent,
    ShowHidePasswordComponent,
    UpdateProgramComponent,
    ShortNumberPipe,
    CountUpDirective,
    StepTemplateComponent,
    StepsComponent,
    CreateCustomerComponent,
    CompletePageComponent,
  ],
  imports: [
    BrowserModule,
    DataTablesModule,
    NgOtpInputModule,
    FormsModule,
    ReactiveFormsModule, 
    HttpClientModule,
    NgbModule,
    NgbModalModule,
    NgbDatepickerModule,
    NgxDropzoneModule,
    BrowserAnimationsModule,
    NgChartsModule,
    ClipboardModule,
    QuillModule.forRoot({
      modules: {
        toolbar: [
          ["bold", "italic", "underline", "strike", "link",  "blockquote", "code", {"list": "bullet"}],
          [{ 'script': 'sub'}, { 'script': 'super' }],
          ['image']
        ],        
      },
      placeholder: "Type your description..."
    }),
    ToastrModule.forRoot(),
    RouterModule.forRoot(appRoutes, {enableTracing: false, anchorScrolling: 'enabled', onSameUrlNavigation: 'reload'}),
    NgxLoadingModule.forRoot(appLoader),
  ],
  providers: [DatePipe, DateAgoPipe, DecimalPipe, TitleCasePipe, JsonPipe, FormCheckService],
  bootstrap: [AppComponent],
  exports: [RouterModule, ShowHidePasswordComponent,]
})
export class AppModule { }
