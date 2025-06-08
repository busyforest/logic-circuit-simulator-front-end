import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {SharedService} from '../../shared.service';

@Component({
  selector: 'app-user-center',
  imports: [
    RouterLink
  ],
  templateUrl: './user-center.component.html',
  styleUrl: './user-center.component.css'
})
export class UserCenterComponent {
  constructor(protected sharedService:SharedService) {
  }
}
