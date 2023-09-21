import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FunctionsService {
  genders = [
    { id: 1, name: 'Female' },
    { id: 2, name: 'Male' },
  ];

  constructor() {}

  getBase64(file: any) {
    return new Promise((resolve) => {
      //let baseURL = "";
      // Make new FileReader
      let reader = new FileReader();
      // Convert the file to base64 text
      reader.readAsDataURL(file);
      // on reader load something...
      reader.onload = () => {
        // Make a fileInfo Object
        const baseURL = reader.result;
        resolve(baseURL);
      };
    });
  }
}
