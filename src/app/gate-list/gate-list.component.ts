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
    {id: 1, typeId: 1, name: 'AND', input: [], output: 0, icon:'/assets/gates/and.png'},
    {id: 2, typeId: 2, name: 'OR', input: [], output: 0, icon:'/assets/gates/or.png'},
    {id: 3, typeId: 3, name: 'NOT', input: [], output: 0, icon:'/assets/gates/not.png'},
    {id: 4, typeId: 4, name: 'NAND', input: [], output: 0, icon:'/assets/gates/nand.png'},
    {id: 5, typeId: 5, name: 'NOR', input: [], output: 0, icon:'/assets/gates/nor.png'},
    {id: 6, typeId: 6, name: 'INPUT', input: [], output: 0, icon:'/assets/gates/input.png'},
    {id: 7, typeId: 7, name: 'OUTPUT', input: [], output: 0, icon:'/assets/gates/output.png'},
  ]
  onDragStart(event: DragEvent, gate: Gate) {
    event.dataTransfer?.setData('application/json', JSON.stringify(gate));
  }
}
