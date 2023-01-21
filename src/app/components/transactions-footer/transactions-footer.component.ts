import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-transactions-footer',
  templateUrl: './transactions-footer.component.html',
  styleUrls: ['./transactions-footer.component.css']
})
export class TransactionsFooterComponent implements OnInit {
  @Input() tableLength!: number;

  constructor() { }

  ngOnInit(): void {
  }

}
