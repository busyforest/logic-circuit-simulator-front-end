import { Component } from '@angular/core';
import {CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart} from '@angular/cdk/drag-drop';
import { Gate } from '../model/gate';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  imports: [
    CdkDrag,
    NgForOf,
    NgIf,
    NgStyle,
  ],
  standalone: true,
  styleUrls: ['./canvas.component.css'],
})
export class CanvasComponent {
  canvasGates: Gate[] = [];
  currentMaxZIndex = 1; // 控制显示层级
  selectedGates: Gate[] = [];
  connectingMode: 'connect' | 'disconnect' | null = null;
  connectionPaths: { d: string }[] = [];

  isDeleteMode = false;
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
    // const index = this.canvasGates.findIndex(g => g.id === gate.id);
    // if (index !== -1) {
    //   this.canvasGates.splice(index, 1);
    //   this.updateConnectionPaths();
    // }

    // 如果不是INPUT门就不让修改
    if(gate.name !== "INPUT"){
      return;
    }

    // 切换 output：0 变 1，1 变 0
    if (gate.output === 0) {
      gate.output = 1;
    } else if (gate.output === 1) {
      gate.output = 0;
    } else {
      // 如果不是 0 或 1，默认赋值为 0
      gate.output = 0;
    }

    this.updateConnectionPaths(); // 如果修改 output 后需要更新连接路径，调用更新函数
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
    else if (this.isDeleteMode) {
      // 删除门
      const index = this.canvasGates.findIndex(g => g.id === gate.id);
      if (index !== -1) {
        const deletedGate = this.canvasGates[index];

        // 先删除所有与该门相关的连接：遍历所有门的 connections
        for (const g of this.canvasGates) {
          if (g.connections) {
            // 过滤掉连接中指向或来自删除门的id
            g.connections = g.connections.filter(connId => connId !== deletedGate.id);
          }

          // 更新 input，移除与被删门output相同的值
          if (g.input) {
            g.input = g.input.filter(inputVal => inputVal !== deletedGate.output);
          }

          // 如果有 inputSources，也过滤掉来自删除门的输入来源
          if (g.inputSources) {
            g.inputSources = g.inputSources.filter(src => src.id !== deletedGate.id);
          }
        }

        // 最后删除该门
        this.canvasGates.splice(index, 1);
        // 更新连线
        this.updateConnectionPaths();
      }

      // 退出删除模式
      this.isDeleteMode = false;
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

  // 切换删除模式
  toggleDeleteMode() {
    this.isDeleteMode = !this.isDeleteMode;
    this.connectingMode = null;
    this.selectedGates = [];
  }

  connectGates(gate1: Gate, gate2: Gate){
    gate1.connections = gate1.connections || [];

    // 存连接的目标ID，表示箭头方向从gate1指向gate2
    if(!gate1.connections.includes(gate2.id)){
      gate1.connections.push(gate2.id);

      // 添加输入时，检查是否已经由该 gate1 提供
      if (!gate2.inputSources) gate2.inputSources = [];

      const alreadyConnected = gate2.inputSources.some(source => source.id === gate1.id);
      if (!alreadyConnected) {
        gate2.inputSources.push({ id: gate1.id, value: gate1.output });
        gate2.input = gate2.inputSources.map(source => source.value);
      }
    }
  }

  disconnectGates(gate1: Gate, gate2: Gate){
    gate1.connections = (gate1.connections || []).filter(id => id !== gate2.id);

    const index = gate1.connections.indexOf(gate2.id);
    if (index !== -1) {
      gate1.connections.splice(index, 1);
    }

    if (gate2.inputSources) {
      gate2.inputSources = gate2.inputSources.filter(source => source.id !== gate1.id);
      gate2.input = gate2.inputSources.map(source => source.value);
    }
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

        // 初始化 inputSources 数组，防止 undefined
        if (!target.inputSources) {
          target.inputSources = [];
        }

        // 查找 target.inputSources 是否已有来自当前 gate 的输入
        const sourceIndex = target.inputSources.findIndex(src => src.id === gate.id);

        if (sourceIndex !== -1) {
          // 找到，更新对应值为 gate.output
          target.inputSources[sourceIndex].value = gate.output;
        } else {
          // 没有，新增
          target.inputSources.push({ id: gate.id, value: gate.output });
        }

        // 同步更新 target.input 数组 — 保持和 inputSources 顺序一致
        target.input = target.inputSources.map(src => src.value);
      }
    }

    this.connectionPaths = paths;
  }
  // 保存电路图，发送给后端
  onSaveButtonClicked() {
    const components = this.canvasGates.map((gate: Gate) => ({
      componentTypeId: gate.typeId,
      label: gate.name,
      posX: gate.x ?? 0,
      posY: gate.y ?? 0,
      inputState: JSON.stringify(gate.input.map(i => i)), // 深拷贝
      outputState: JSON.stringify([gate.output]),
    }));

    const wires: any[] = [];
    // 从每个 gate 的 connections 中生成 wire 信息
    for (const fromGate of this.canvasGates) {
      if (!fromGate.connections) continue;

      for (let i = 0; i < fromGate.connections.length; i++) {
        const toId = fromGate.connections[i];
        const toGate = this.canvasGates.find(g => g.id === toId);
        if (!toGate) continue;

        // 假设 outputSignal 为 fromGate.output，且连接到 toGate.input[i]
        wires.push({
          fromComponentId: fromGate.id,
          fromPortIndex: 0, // 默认为第一个输出
          toComponentId: toGate.id,
          toPortIndex: i, // 假设顺序一致，若不一致要用 inputSources 映射
          signalValue: fromGate.output
        });
      }
    }

    const payload = {
      userId: 1,
      name: "test",
      description: "描述",
      components,
      wires,
    };
    this.http.post('http://localhost:8080/api/circuits/save', payload).subscribe({
      next: () => alert('电路图保存成功！'),
      error: err => alert('保存失败：' + err.message)
    });
  }
  onRunButtonClicked(){
    const components = this.canvasGates.map((gate: Gate) => ({
      componentTypeId: gate.typeId,
      label: gate.name,
      tempId:gate.name,
      posX: gate.x ?? 0,
      posY: gate.y ?? 0,
      inputState: JSON.stringify(gate.input.map(i => i)), // 深拷贝
      outputState: JSON.stringify([gate.output]),
    }));

    const wires: any[] = [];
    // 从每个 gate 的 connections 中生成 wire 信息
    for (const fromGate of this.canvasGates) {
      if (!fromGate.connections) continue;

      for (let i = 0; i < fromGate.connections.length; i++) {
        const toId = fromGate.connections[i];
        const toGate = this.canvasGates.find(g => g.id === toId);
        if (!toGate) continue;

        // 假设 outputSignal 为 fromGate.output，且连接到 toGate.input[i]
        wires.push({
          fromTempId: fromGate.name,
          fromPortIndex: 0, // 默认为第一个输出
          toTempId: toGate.name,
          signalValue:fromGate.output,
          toPortIndex: i, // 假设顺序一致，若不一致要用 inputSources 映射
        });
      }
    }

    const payload = {
      userId: 1,
      name: "test",
      description: "描述",
      components,
      wires,
    };
    // console.log('📦 请求内容:', JSON.stringify(payload, null, 2));
    this.http.post('http://localhost:8080/api/circuits/simulate', payload).subscribe({
      next: () => alert('成功返回计算结果'),
      error: err => alert('计算失败：' + err.message)
    });
  }
  constructor(private http:HttpClient) {

  }

}
