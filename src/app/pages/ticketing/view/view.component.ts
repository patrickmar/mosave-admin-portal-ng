import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  header = ['Image', 'Title', 'Merchant', 'Event Date', 'Qty sold', 'Status', 'Action']
  allTickets!: Array<any>;

  constructor(private dataService: DataService) { 
    this.getAllTickets();
  }

  ngOnInit(): void {
    
  }

  getAllTickets(){
    this.dataService.getAllTickets().subscribe((res: any) => {
      console.log(res);
      this.allTickets = res;      
    });
    
  }

}
