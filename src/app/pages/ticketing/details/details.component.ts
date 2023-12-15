import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChartType } from 'chart.js';
import { ClipboardService } from 'ngx-clipboard';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { StatService } from 'src/app/services/stat.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class TicketDetailsComponent implements OnInit, OnDestroy {
  data: any;
  time = new Date();
  allRecords!: Array<any>;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();
  imageBaseURL: string = environment.app.baseUrl + environment.app.imagePath;
  emptyTable = environment.emptyTable;
  ticketId!: string | null;
  ticketSum: any;
  bestCustomers!: any[];
  bestCategories!: any[];
  bestChannels!: any[];
  colMap: any = { '0': 'end', '1': 'start', '2': 'start' };
  public barChartOptions: any = this.getChartConfig(10000, '₦');
  public barChartType: ChartType = 'bar';
  public barChartLabels = ['POS', 'Cash', 'Others'];
  public barChartData!: any;
  color: Array<string> = ['#377dff', '#00c9db', '#7000f2'];
  usedTicket: any;
  isCopied!: boolean;
  img = environment.mini_logo;
  modalContent!: object | any;
  public loading = false;
  public showComponent = false;
  public url: string = environment.production
    ? 'https://motickets.moloyal.com/motickets/ticket.php?e='
    : 'https://moloyal.com/test/motickets/ticket.php?e=';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private toastService: ToastService,
    private statService: StatService,
    private _clipboardService: ClipboardService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initDatatable();
    this.getTickets();
    this.getTicketsById();
    this._clipboardService.copyResponse$.subscribe((res: any) => {
      if (res.isSuccess) {
        this.toastService.showSuccess('Copied!', '');
      } else {
        this.toastService.showError('Copy failed!', '');
      }
    });
  }

  ngOnDestroy(): void {
    // We will unsubscribe the even
    this.dtTrigger.unsubscribe();
  }

  onCopyFailure() {
    this.toastService.showError('Not Copied', '');
  }

  getChartConfig(stepSize: number, postfix: string) {
    return {
      responsive: true,
      aspectRatio: 1.6,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          position: 'nearest',
          mode: 'index',
          intersect: false,
          callbacks: {
            title: (tooltipItems: any) => {
              return tooltipItems[0].label;
            },
            footer: (tooltipItems: any) => {
              let sum = 0;
              // Calculate sum
              tooltipItems.forEach((tooltipItem: any, i: number) => {
                sum = sum + tooltipItem.parsed.y;
              });
              return 'Sum: ' + sum;
            },
            label: (tooltipItems: any) => {
              return (
                tooltipItems.dataset.label +
                ': ' +
                postfix +
                tooltipItems.formattedValue
              );
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Dates',
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
        y: {
          title: {
            display: true,
            text: 'Earnings',
          },
          grid: {
            drawBorder: false,
            color: '#e7eaf3',
          },
          min: 0,
          //max: 100000,
          ticks: {
            stepSize: stepSize,
            //padding: 10,
          },
        },
      },
    };
  }

  getTicketId() {
    const ticketId = this.route.snapshot.paramMap.get('sn');
    this.ticketId = ticketId;
    return ticketId;
  }

  getTickets() {
    try {
      this.dataService.getAllTickets().subscribe((res: any) => {
        const filter = res.data.filter((val: any) => {
          return val.sn == this.getTicketId();
        });
        this.data = filter[0];
      });
    } catch (error) {
      this.toastService.showError('Please check your internet', 'Error');
    }
  }

  getTicketsById() {
    const ticketId = Number(this.getTicketId());
    try {
      this.loading = true;
      this.dataService.getTicketsById(ticketId).subscribe(
        (res: any) => {
          this.loading = false;
          this.showComponent = true;
          this.allRecords = res;
          this.ticketSum = this.allRecords.reduce(
            (sum: any, current: any) => sum + Number(current.amount),
            0
          );

          //   let result2 = this.allRecords.reduce((acc:any, current: any) =>{
          //     acc[current.used] =  (acc[current.used] || 0) + 1; //acc[current.used]++;
          //     return acc;
          // }, {});

          this.usedTicket = this.allRecords.reduce(
            (acc, { used }) => acc + (used === '0' ? 0 : 1),
            0
          );
          this.bestCustomers = this.statService.getTicketSoldByAmount(
            this.allRecords,
            this.ticketSum
          );
          this.bestCategories = this.statService.getTicketSoldByCategory(
            this.allRecords
          );
          this.bestChannels = this.statService.getTicketSoldByChannel(
            this.allRecords,
            this.ticketSum
          );
          const trnx = this.statService.getTicketTrnxByDays(this.allRecords);
          const labels: Array<string> = [];
          const pos: Array<number> = [];
          const cash: Array<number> = [];
          const others: Array<number> = [];
          new Array(trnx.length).fill(null).map((x, i) => {
            const element = trnx[i];
            labels.push(element?.date);
            pos.push(element?.pos);
            cash.push(element?.cash);
            others.push(element?.others);
          });
          this.barChartData = {
            labels: labels,
            datasets: [
              {
                label: this.barChartLabels[0],
                data: pos,
                backgroundColor: this.color[0],
                hoverBackgroundColor: this.color[0],
                borderColor: this.color[0],
              },
              {
                label: this.barChartLabels[1],
                data: cash,
                backgroundColor: this.color[1],
                hoverBackgroundColor: this.color[1],
                borderColor: this.color[1],
              },
              {
                label: this.barChartLabels[2],
                data: others,
                backgroundColor: this.color[2],
                hoverBackgroundColor: this.color[2],
                borderColor: this.color[2],
              },
            ],
          };
          this.dtTrigger.next('');
        },
        (error: any) => {
          this.loading = false;
          this.toastService.showError('Error fetching ticket details', 'Error');
        }
      );
    } catch (error) {
      this.loading = false;
      this.toastService.showError('Please check your internet', 'Error');
    }
  }

  viewRecord(id: string) {
    if (id) {
      this.router.navigate(['/transfers', btoa(id), 'details']);
    }
  }

  download(name: string) {
    var table = '#datatable';
    $(table)
      .DataTable()
      .button('.buttons-' + name)
      .trigger();
  }

  filter(event: any, tableName: string) {
    var value = event.target.value;
    if (value.length > 0) {
      $('#' + tableName)
        .DataTable()
        .search(value)
        .draw();
    }
  }

  open(content: any, tableRow: any) {
    this.modalContent = tableRow;
    this.modalService.open(content);
  }

  initDatatable() {
    var self = this;
    const dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 20,
      processing: true,
      language: {
        zeroRecords: `<div class="text-center p-4">
            <img class="mb-3" src="${this.emptyTable}" alt="Image Description" style="width: 10rem;">
          <p class="mb-0">No data to show</p>
          </div>`,
      },
      lengthMenu: [10, 15, 20],
      // select: true,
      dom: 'Brtip',
      buttons: [
        {
          extend: 'copy',
          className: 'd-none',
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5],
          },
        },
        {
          extend: 'print',
          className: 'd-none',
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5],
          },
        },
        {
          extend: 'excel',
          className: 'd-none',
          filename: () => {
            return self.data?.title + '_event_customers' + new Date().getTime();
          },
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5],
          },
        },
        {
          extend: 'csv',
          className: 'd-none',
          filename: () => {
            return self.data?.title + '_event_customers' + new Date().getTime();
          },
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5],
          },
        },
        {
          extend: 'pdf',
          className: 'd-none',
          filename: () => {
            return self.data?.title + '_event_customers' + new Date().getTime();
          },
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5],
          },
        },
      ],
      // columnDefs: [
      //   {
      //       targets: [ 5 ],
      //       visible: false,
      //       searchable: false
      //   },
      // ],
      info: true,
      lengthChange: true,
    };
    this.dtOptions[0] = dtOptions;
  }
}
