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
    {id: 1, name: 'AND', input: 0, output: 0, icon:'/assets/gates/and.png'},
    {id: 2, name: 'OR', input: 0, output: 0, icon:'/assets/gates/or.png'},
    {id: 3, name: 'NOT', input: 0, output: 0, icon:'/assets/gates/not.png'},
    {id: 4, name: 'INPUT', input: 0, output: 0, icon:'/assets/gates/input.png'},
    {id: 5, name: 'OUTPUT', input: 0, output: 0, icon:'/assets/gates/output.png'},
  ]
  onDragStart(event: DragEvent, gate: Gate) {
    event.dataTransfer?.setData('application/json', JSON.stringify(gate));
  }
}
