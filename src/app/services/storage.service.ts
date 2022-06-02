import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  async store(storageKey: string, value: any) {
    // encrypt the value
    const encryptedValue = btoa(escape(JSON.stringify(value)));
    await localStorage.setItem(storageKey, encryptedValue);
  }

  async get(storageKey: string) {
    const res = await localStorage.getItem(storageKey);
    if (res) {
      // decrypt the value
      return JSON.parse(unescape(atob(res)));
    } else {
      return false;
    }
  }

  async removeItem(storageKey: string) {
    await localStorage.removeItem(storageKey);
  }

  async clear() {
    await localStorage.clear();
  }

  checkValue(storageKey: string) {
    const res = localStorage.getItem(storageKey);
    // decrypt the value
    //return res !== null ? !!JSON.parse(unescape(atob(res))) : {};
    //or
    return !!JSON.parse(unescape(atob(res!)));
  }
}
