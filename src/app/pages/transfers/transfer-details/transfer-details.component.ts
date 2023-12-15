import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { ToastService } from 'src/app/services/toast.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-transfer-details',
  templateUrl: './transfer-details.component.html',
  styleUrls: ['./transfer-details.component.css'],
})
export class TransferDetailsComponent implements OnInit {
  transferRecord!: object | any;
  loading!: boolean;
  public showComponent = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private dataService: DataService,
    private toastService: ToastService,
    private injector: Injector
  ) {}

  ngOnInit(): void {
    this.getTransferRecord();
  }

  getTransferId() {
    return this.route.snapshot.paramMap.get('id');
  }

  getTransferRecord(): void {
    const transferId = atob(this.getTransferId() + '');
    try {
      this.loading = true;
      this.dataService.getCustomerTransferRecord(transferId).subscribe(
        (res: any) => {
          if (res?.status == true) {
            this.loading = false;
            this.showComponent = true;
            this.transferRecord = res.data;
          } else {
            this.toastService.showError(res?.message, 'Error');
          }
        },
        (error: any) => {
          this.loading = false;
          this.toastService.showError('Error fetching data', 'Error');
        }
      );
    } catch (error: any) {
      console.log(error);
      this.loading = false;
      this.toastService.showError(error?.message, 'Error');
    }
  }

  back(): void {
    const activatedRoute = this.injector.get(ActivatedRoute);
    this.router.navigate(['..'], { relativeTo: activatedRoute });
  }

  goBack(): void {
    this.location.back();
  }
}
