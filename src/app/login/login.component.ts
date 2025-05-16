import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    FormsModule
  ]
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private router: Router) {}

  login() {
    // 假设登录验证成功
    if (this.username === 'admin' && this.password === '123456') {
      this.router.navigate(['/editor']);
    } else {
      alert('用户名或密码错误');
    }
  }
}
