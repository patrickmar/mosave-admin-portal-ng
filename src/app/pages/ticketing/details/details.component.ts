import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class TicketDetailsComponent implements OnInit {
  data: any;
  time = new Date();

  constructor(private route: ActivatedRoute, private dataService: DataService) { }

  ngOnInit(): void {
    this.getTickets();
  }

  getTicketId() {
    const ticketId = this.route.snapshot.paramMap.get('sn');
    return ticketId; 
  }

  getTickets(){
    this.dataService.getAllTickets().subscribe((res: any) => {
      console.log(res);    
      const filter = res.filter((val: any) =>{
        return val.id == this.getTicketId();
      });
      console.log(filter[0]);
      this.data = filter[0];
    });
  }

}
