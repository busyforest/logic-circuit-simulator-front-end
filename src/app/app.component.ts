import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CanvasComponent} from './canvas/canvas.component';
import {GateListComponent} from './gate-list/gate-list.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CanvasComponent, GateListComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'WebPJ-Front';
}
