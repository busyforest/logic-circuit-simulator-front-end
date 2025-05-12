import { Component } from '@angular/core';
import {CdkDrag, CdkDragEnd} from '@angular/cdk/drag-drop';
import { Gate } from '../model/gate';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  imports: [
    CdkDrag,
    NgForOf
  ],
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent {
  canvasGates: Gate[] = [];

  // 从 GateList 拖入 Canvas 的方式（模拟创建）
  onGateDrop(gate: Gate) {
    this.canvasGates.push({
      ...gate,
      x: 50,
      y: 50,
      id: Date.now() + Math.random() // 确保唯一性
    });
  }

  onDragEnd(event: CdkDragEnd, gate: Gate) {
    const pos = event.source.getRootElement().getBoundingClientRect();
    const parent = (event.source.getRootElement().parentElement as HTMLElement).getBoundingClientRect();
    gate.x = pos.left - parent.left;
    gate.y = pos.top - parent.top;
  }
  dropFromOutside(event: DragEvent) {
    event.preventDefault();
    const data = event.dataTransfer?.getData('application/json');
    if (data) {
      const gate = JSON.parse(data) as Gate;
      const canvasRect = (event.target as HTMLElement).getBoundingClientRect();
      this.canvasGates.push({
        ...gate,
        id: Date.now() + Math.random(),
        x: event.clientX - canvasRect.left,
        y: event.clientY - canvasRect.top
      });
    }
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }
}
