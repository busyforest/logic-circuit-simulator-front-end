import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {FormsModule} from '@angular/forms';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  imports: [
    FormsModule,
    NgClass,
    NgIf
  ],
  styleUrls: ['./user-register.component.css']
})

export class UserRegisterComponent implements OnInit {
  username = '';
  password = '';
  email = '';
  phone = '';
  register() {
    const url = "http://localhost:8080/api/user/register";
    const httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json'}),
    };
    this.http.post(url,
      {
        username: this.username,
        password: this.password,
        email: this.email,
        phone: this.phone,
      }, httpOptions).subscribe((response:any)=> {
      window.alert(response.message);
    });
  }
  constructor(public http:HttpClient) { }

  ngOnInit() {
  }

}
