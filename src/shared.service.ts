import { Injectable } from '@angular/core';
import {Circuit} from './app/model/circuit';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public isBarOpen: boolean = false;
  public username: string = "";
  public isLoggedIn: boolean = false;
  public userId: number = 0;
  public circuits: Circuit[] | undefined;
  public templates: Circuit[] | undefined;
  public serverAddress:String = "8.133.243.85";
  constructor() {

  }
}
