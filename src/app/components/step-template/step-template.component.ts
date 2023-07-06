import { Component, Input, OnInit } from '@angular/core';
import { StepModel } from 'src/app/models/step.model';

@Component({
  selector: 'app-step-template',
  templateUrl: './step-template.component.html',
  styleUrls: ['./step-template.component.css']
})
export class StepTemplateComponent implements OnInit {

  @Input() step!: StepModel | null;

  constructor() { }

  ngOnInit(): void {
  }

  onCompleteStep() {
    this.step!.isComplete = true;
  }

}
