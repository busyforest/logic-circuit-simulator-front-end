import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {SharedService} from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private service: SharedService,
              private router: Router) {}

  canActivate(): boolean {
    if (this.service.isLoggedIn) {
      return true;
    }
    window.alert('请先登录！');
    this.router.navigate(['/login']);
    return false;
  }
}
