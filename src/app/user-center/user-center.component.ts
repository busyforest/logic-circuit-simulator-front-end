import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {SharedService} from '../../shared.service';
import {HttpClient} from '@angular/common/http';
import {DatePipe, NgForOf} from '@angular/common';
import {Circuit} from '../model/circuit';
import {Gate} from '../model/gate';
import {map, Observable} from 'rxjs';

@Component({
  selector: 'app-user-center',
  imports: [
    RouterLink,
    NgForOf,
    DatePipe
  ],
  templateUrl: './user-center.component.html',
  styleUrl: './user-center.component.css'
})
export class UserCenterComponent implements OnInit{
  onCircuitClicked(circuitId:number){
    this.route.navigate(['/editor', circuitId]);
  }
  constructor(protected sharedService:SharedService, private http:HttpClient, private route:Router) {
  }

  ngOnInit(): void {
    this.getCircuits().subscribe(data => {
      this.sharedService.circuits = data;
    });
  }
  getCircuits(): Observable<Circuit[]> {
    return this.http.get<any>(`http://localhost:8080/webpj/circuits/listByUser?userId=${this.sharedService.userId}`).pipe(
      map(response => response.data as Circuit[])
    );
  }
}
