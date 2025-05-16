import { Component } from '@angular/core';
import {GateListComponent} from '../gate-list/gate-list.component';
import {CanvasComponent} from '../canvas/canvas.component';

@Component({
  selector: 'app-circuit-editor',
  imports: [
    GateListComponent,
    CanvasComponent
  ],
  templateUrl: './circuit-editor.component.html',
  styleUrl: './circuit-editor.component.css'
})
export class CircuitEditorComponent {

}
