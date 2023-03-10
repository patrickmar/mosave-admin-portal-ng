import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  header = ['Image', 'Title', 'Merchant', 'Event Date', 'Qty sold', 'Status', 'Action']
  allTickets!: Array<any>;

  constructor() { }

  ngOnInit(): void {
    this.getAllTickets();
  }

  getAllTickets(){
    this.allTickets = [
      {
        id: 1,
        title: 'Muson Festival',
        image: '', 
        merchant: 'Muson', 
        date: '05/10/2022',
        qtySold: 50,
        active: true
      },
      {
        id: 2,
        title: 'Flytime Festival',
        image: '', 
        merchant: 'Flytime', 
        date: '05/10/2022',
        qtySold: 30,
        active: true
      },
      {
        id: 3,
        title: 'Fair acres musical show',
        image: '', 
        merchant: 'Fairacres', 
        date: '05/10/2022',
        qtySold: 40,
        active: true
      }

    ]
    
  }

}
