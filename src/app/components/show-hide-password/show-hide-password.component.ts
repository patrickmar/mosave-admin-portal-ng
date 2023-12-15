import { Component, ContentChild, ElementRef } from '@angular/core';

//import { IonInput } from '@ionic/angular';

@Component({
  selector: 'app-show-hide-password',
  templateUrl: './show-hide-password.component.html',
  styleUrls: ['./show-hide-password.component.scss'],
})
export class ShowHidePasswordComponent {
  show = false;

  //@ContentChild(IonInput) input: IonInput;

  @ContentChild('passwordInput') input!: ElementRef;

  constructor() {}

  toggleShow() {
    this.show = !this.show;
    if (this.show) {
      this.input.nativeElement.attributes.type = 'text';
    } else {
      this.input.nativeElement.attributes.type = 'password';
    }
  }

  ngAfterContentInit() {
    console.log(this.input);
  }
}
