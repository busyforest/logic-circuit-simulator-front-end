import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public isBarOpen: boolean = false;
  public username: string = "";
  public isLoggedIn: boolean = false;
  constructor() {

  }
}
