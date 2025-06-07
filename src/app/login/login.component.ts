import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    FormsModule,
    RouterLink,
    NgIf,
    NgClass
  ]
})
export class LoginComponent {
  userEmail = '';
  password = '';

  constructor(private router: Router, private http:HttpClient) {}

  login() {
    const payload = {
      email:this.userEmail,
      password:this.password,
    }
    // 假设登录验证成功
    this.http.post('http://localhost:8080/api/user/login', payload).subscribe({
      next: (response:any)=>{
        console.log(response)
        if(response.code == 200){
          this.router.navigate(['/user_center']);

        }else{
          alert('登录失败：' + response.message);
        }
      },
      error: err => alert('登录失败：' + err.message)
    });
  }
}
