import { Component } from '@angular/core';
import {Gate} from '../model/gate';
import {NgForOf} from '@angular/common';
import {DragDropModule} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-gate-list',
  imports: [
    NgForOf,
    DragDropModule
  ],
  templateUrl: './gate-list.component.html',
  standalone: true,
  styleUrl: './gate-list.component.css'
})
export class GateListComponent {
  gates: Gate[] = [
    {id: 1, name: 'AND', input: 0, output: 0},
    {id: 2, name: 'OR', input: 0, output: 0},
    {id: 3, name: 'NOT', input: 0, output: 0}
  ]
  onDragStart(event: DragEvent, gate: Gate) {
    event.dataTransfer?.setData('application/json', JSON.stringify(gate));
  }
}
