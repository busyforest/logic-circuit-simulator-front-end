import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CanvasComponent} from './canvas/canvas.component';
import {GateListComponent} from './gate-list/gate-list.component';
import {TopBarComponent} from './top-bar/top-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CanvasComponent, GateListComponent, TopBarComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'WebPJ-Front';
}
