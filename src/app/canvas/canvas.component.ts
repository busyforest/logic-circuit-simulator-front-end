import { Component } from '@angular/core';
import {CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart} from '@angular/cdk/drag-drop';
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

  selectedGates: Gate[] = [];
  connectingMode: 'connect' | 'disconnect' | null = null;
  connectionPaths: { d: string }[] = [];

  // 控制层级，保证拖动时始终位于最上层
  onDragStarted(event: CdkDragStart, gate: Gate) {
    this.currentMaxZIndex++;
    gate.z = this.currentMaxZIndex;
  }

  onDragMoved(event: CdkDragMove, gate: Gate) {
    const canvasEl = event.source.getRootElement().parentElement as HTMLElement;
    const canvasRect = canvasEl.getBoundingClientRect();

    // 计算相对于canvas左上角的坐标，减去元件宽高的一半偏移
    let x = event.pointerPosition.x - canvasRect.left - 17.5;
    let y = event.pointerPosition.y - canvasRect.top - 20;

    // 限制不超出画布边界
    x = Math.min(Math.max(0, x), canvasRect.width - 35);
    y = Math.min(Math.max(0, y), canvasRect.height - 40);

    gate.x = x;
    gate.y = y;

    this.updateConnectionPaths();
  }

  onDragEnd(event: CdkDragEnd, gate: Gate) {
    const pos = event.source.getRootElement().getBoundingClientRect();
    const parent = (event.source.getRootElement().parentElement as HTMLElement).getBoundingClientRect();

    // 计算相对canvas左上角坐标
    let x = pos.left - parent.left;
    let y = pos.top - parent.top;

    // 限制不超出画布边界
    x = Math.min(Math.max(0, x), parent.width - 35);
    y = Math.min(Math.max(0, y), parent.height - 40);

    gate.x = x;
    gate.y = y;

    this.updateConnectionPaths();
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
        y: event.clientY - canvasRect.top,
        connections: []
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
      this.updateConnectionPaths();
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

  onGateClick(gate: Gate) {
    if(this.connectingMode){
      if(!this.selectedGates.includes(gate)){
        this.selectedGates.push(gate);
      }

      if(this.selectedGates.length === 2){
        const [gate1, gate2] = this.selectedGates;
        if(this.connectingMode === 'connect'){
          this.connectGates(gate1, gate2);  // 箭头从gate1指向gate2
        }
        else if(this.connectingMode === 'disconnect'){
          this.disconnectGates(gate1, gate2);
        }
        this.selectedGates = [];
        this.connectingMode = null;
        this.updateConnectionPaths();
      }
    }
  }

  startConnect() {
    this.selectedGates = [];
    this.connectingMode = 'connect';
  }

  startDisconnect(){
    this.selectedGates = [];
    this.connectingMode = 'disconnect';
  }

  connectGates(gate1: Gate, gate2: Gate){
    gate1.connections = gate1.connections || [];
    // 存连接的目标ID，表示箭头方向从gate1指向gate2
    if(!gate1.connections.includes(gate2.id)){
      gate1.connections.push(gate2.id);
    }
  }

  disconnectGates(gate1: Gate, gate2: Gate){
    gate1.connections = (gate1.connections || []).filter(id => id !== gate2.id);
  }

  updateConnectionPaths() {
    const paths: { d: string }[] = [];

    for (const gate of this.canvasGates) {
      if (!gate.connections) {
        continue;
      }

      for (const targetId of gate.connections) {
        const target = this.canvasGates.find(g => g.id === targetId);
        if (!target) {
          continue;
        }

        // 斜线起点与终点（从 gate 右侧中心点到 target 左侧中心点）
        const x1 = (gate.x || 0) + 35;
        const y1 = (gate.y || 0) + 20;
        const x2 = (target.x || 0);
        const y2 = (target.y || 0) + 20;

        // 直线：从 x1,y1 到 x2,y2
        const d = `M ${x1} ${y1} L ${x2} ${y2}`;
        paths.push({ d });
      }
    }

    this.connectionPaths = paths;
  }
}
