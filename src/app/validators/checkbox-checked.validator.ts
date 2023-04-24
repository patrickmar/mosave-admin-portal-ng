import { ValidatorFn, FormArray, AbstractControl } from '@angular/forms';

export class CheckboxCheckedValidator {

  static minSelectedCheckboxes(min:number) {
    const validator: ValidatorFn = (formArray: AbstractControl)  => {
      if (formArray instanceof FormArray) {
        const totalSelected = formArray.controls
        // get a list of checkbox values (boolean)
        .map(control => control.value)
        // total up the number of checked checkboxes
        .reduce((prev, next) => next ? prev + next : prev, 0);
      // if the total is not greater than the minimum, return the error message
      return totalSelected >= min ? null : { required: true };
      }
      else{
      throw new Error('formArray is not an instance of FormArray');
      }
      
    };

    return validator;
  }
}
