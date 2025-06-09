import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {NgForOf} from '@angular/common';
import {map, Observable} from 'rxjs';
import {Circuit} from '../model/circuit';
import {SharedService} from '../../shared.service';

@Component({
  selector: 'app-template-selector',
  templateUrl: './template-selector.component.html',
  imports: [
    NgForOf
  ],
  styleUrls: ['./template-selector.component.css']
})
export class TemplateSelectorComponent implements OnInit {
  constructor(private router: Router, private http: HttpClient, protected sharedService:SharedService) {}

  ngOnInit(): void {
    this.getCircuits().subscribe(data => {
      this.sharedService.templates = data;
    });
  }

  selectTemplate(templateId: number) {
    this.router.navigate(['/editor', templateId]);
  }
  getCircuits(): Observable<Circuit[]> {
    return this.http.get<any>(`http://localhost:8080/webpj/circuits/template`).pipe(
      map(response => response.data as Circuit[])
    );
  }
}
