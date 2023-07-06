import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StepModel } from 'src/app/models/step.model';
import { StepsService } from 'src/app/services/steps.service';

@Component({
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CreateCustomerComponent implements OnInit {
  currentStep!: Observable<StepModel>;

  constructor(
    private stepsService: StepsService,
    private router: Router) { }

  ngOnInit(): void {
    this.currentStep = this.stepsService.getCurrentStep();
  }

  onNextStep() {
    if (!this.stepsService.isLastStep()) {
      this.stepsService.moveToNextStep();
    } else {
      this.onSubmit();
    }
  }

  showButtonLabel() {
    return !this.stepsService.isLastStep() ? 'Continue' : 'Finish';
  }

  onSubmit(): void {
    this.router.navigate(['/complete']);
  }
}
