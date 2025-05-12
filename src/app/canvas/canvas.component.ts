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

  onRightClick(event: MouseEvent, gate: Gate) {
    event.preventDefault(); // 阻止浏览器默认右键菜单
    const index = this.canvasGates.findIndex(g => g.id === gate.id);
    if (index !== -1) {
      this.canvasGates.splice(index, 1);
    }
  }
}
