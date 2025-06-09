import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {NgClass, NgIf} from '@angular/common';
import {SharedService} from '../../shared.service';
import {Circuit} from '../model/circuit';
import {map, Observable} from 'rxjs';

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

  constructor(private router: Router,
              private http:HttpClient,
              protected sharedService:SharedService) {}

  login() {
    const payload = {
      email:this.userEmail,
      password:this.password,
    }
    // 假设登录验证成功
    this.http.post(`http://${this.sharedService.serverAddress}:8080/webpj/user/login`, payload).subscribe({
      next: (response:any)=>{
        if(response.code == 200){
          this.sharedService.isLoggedIn = true;
          // 获取全局用户名
          this.sharedService.username = response.data.name;
          this.sharedService.userId = response.data.id;
          this.router.navigate(['/user_center']);
          this.getCircuits().subscribe(data => {
            this.sharedService.circuits = data;
          });
        }else{
          alert('登录失败：' + response.message);
        }
      },
      error: err => alert('登录失败：' + err.message)
    });
  }
  getCircuits(): Observable<Circuit[]> {
    return this.http.get<any>(`http://${this.sharedService.serverAddress}:8080/webpj/circuits/listByUser?userId=${this.sharedService.userId}`).pipe(
      map(response => response.data as Circuit[])
    );
  }

}
