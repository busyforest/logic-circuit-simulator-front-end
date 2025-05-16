import { Component } from '@angular/core';
import {CdkDrag, CdkDragEnd, CdkDragStart} from '@angular/cdk/drag-drop';
import { Gate } from '../model/gate';
import {NgForOf, NgIf, NgStyle} from '@angular/common';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  imports: [
    CdkDrag,
    NgForOf,
    NgIf,
    NgStyle
  ],
  standalone: true,
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent {
  canvasGates: Gate[] = [];
  currentMaxZIndex = 1; // 控制显示层级

  // 控制层级，保证拖动时始终位于最上层
  onDragStarted(event: CdkDragStart, gate: Gate) {
    this.currentMaxZIndex++;
    gate.z = this.currentMaxZIndex;
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

  onRightClick(event: MouseEvent, gate: Gate) {
    event.preventDefault(); // 阻止浏览器默认右键菜单
    const index = this.canvasGates.findIndex(g => g.id === gate.id);
    if (index !== -1) {
      this.canvasGates.splice(index, 1);
    }
  }

  // 只显示当前双击的门的真值表
  onDoubleClick(event: MouseEvent, gate: Gate) {
    event.preventDefault();
    if(gate.showTruthTable){
      gate.showTruthTable = false;
      gate.z = 1; // 恢复默认
    }
    else{
      this.canvasGates.forEach(g => {
        g.showTruthTable = false;
        g.z = 1;
      });
      gate.showTruthTable = true;
      this.currentMaxZIndex++;
      gate.z = this.currentMaxZIndex; // 置顶
    }
  }

  getTruthTable(gate: Gate): string[][] {
    switch(gate.name.toLowerCase()){
      case 'and':
        return [['A', 'B', 'A AND B'], ['0', '0', '0'], ['0', '1', '0'], ['1', '0', '0'], ['1', '1', '1']];
      case 'or':
        return [['A', 'B', 'A OR B'], ['0', '0', '0'], ['0', '1', '1'], ['1', '0', '1'], ['1', '1', '1']];
      case 'not':
        return [['A', 'NOT A'], ['0', '1'], ['1', '0']];
      default:
        return [['Unknown']];
    }
  }
}
