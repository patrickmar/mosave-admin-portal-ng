import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
export interface iDeactivateComponent{
  canExit: () => Observable<boolean> | Promise<boolean> | boolean;
  }
export class FormCheckService implements CanDeactivate<iDeactivateComponent> {
  canDeactivate(component: iDeactivateComponent, currentRoute: ActivatedRouteSnapshot, 
    currentState: RouterStateSnapshot, nextState: RouterStateSnapshot){
    return component.canExit();
    }

  constructor() { }
  
}
