import {Component, input, OnInit} from '@angular/core';
import {CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart} from '@angular/cdk/drag-drop';
import { Gate } from '../model/gate';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, ChildActivationEnd, Router} from '@angular/router';
import {SharedService} from '../../shared.service';
import {EvaluationAnimationStep} from '../model/evaluation-animation-step';

const typeIdToIconMap: Record<number, string> = {
  1: '/assets/gates/and.png',
  2: '/assets/gates/or.png',
  3: '/assets/gates/not.png',
  4: '/assets/gates/nand.png',
  5: '/assets/gates/nor.png',
  6: '/assets/gates/input.png',
  7: '/assets/gates/output.png'
};

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  imports: [
    CdkDrag,
    NgForOf,
    NgIf,
    NgStyle,
    FormsModule,
  ],
  standalone: true,
  styleUrls: ['./canvas.component.css'],
})
export class CanvasComponent implements OnInit{
  canvasGates: Gate[] = [];
  currentMaxZIndex = 1; // 控制显示层级
  selectedGates: Gate[] = [];
  connectingMode: 'connect' | 'disconnect' | null = null;
  connectionPaths: { d: string, color:string}[] = [];
  descriptionContent: string='';
  circuitId: number | undefined;
  fileName:string="新建电路"
  steps: EvaluationAnimationStep[] = [];
  isDeleteMode = false;
  singleRunIndex = 0;
  isSingleRunMode = false;
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

    // gate.x = x;
    // gate.y = y;
    gate.pathX = x;
    gate.pathY = y;

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

    // gate.x = x;
    // gate.y = y;
    gate.pathX = x;
    gate.pathY = y;

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
        pathX: event.clientX - canvasRect.left,
        pathY: event.clientY - canvasRect.top,
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
    if (gate.typeId !== 6) {
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
    const paths: { d: string, color: string}[] = [];

    for (const gate of this.canvasGates) {
      if (!gate.connections) continue;

      for (const targetId of gate.connections) {
        const target = this.canvasGates.find(g => g.id === targetId);
        if (!target) continue;

        const x1 = (gate.pathX || 0) + 35;
        const y1 = (gate.pathY || 0) + 20;
        const x2 = (target.pathX || 0);
        const y2 = (target.pathY || 0) + 20;

        const d = `M ${x1} ${y1} L ${x2} ${y2}`;
        paths.push({ d ,color:"black"});

        // 同步输入逻辑
        if (!target.inputSources) target.inputSources = [];
        const sourceIndex = target.inputSources.findIndex(src => src.id === gate.id);
        if (sourceIndex !== -1) {
          target.inputSources[sourceIndex].value = gate.output;
        } else {
          target.inputSources.push({ id: gate.id, value: gate.output });
        }
        target.input = target.inputSources.map(src => src.value);
      }
    }

    this.connectionPaths = paths;
  }
  // 保存电路图，发送给后端
  onSaveButtonClicked() {
    const components = this.canvasGates.map((gate: Gate) => ({
      tempId:gate.id,
      componentTypeId: gate.typeId,
      label: gate.name,
      posX: gate.pathX ?? 0,
      posY: gate.pathY ?? 0,
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
          fromTempId: fromGate.id,
          fromPortIndex: 0, // 默认为第一个输出
          toTempId: toGate.id,
          toPortIndex: i, // 假设顺序一致，若不一致要用 inputSources 映射
          signalValue: fromGate.output
        });
      }
    }

    const payload = {
      userId: this.sharedService.userId,
      circuitId: this.circuitId,
      name: this.fileName,
      description: this.descriptionContent,
      components,
      wires,
    };
    console.log(payload);
    this.http.post('http://localhost:8080/webpj/circuits/save', payload).subscribe({
      next: () => alert('电路图保存成功！'),
      error: err => alert('保存失败：' + err.message)
    });
  }
  onRunButtonClicked(){
    const components = this.canvasGates.map((gate: Gate) => ({
      componentTypeId: gate.typeId,
      label: gate.name,
      tempId:gate.id,
      posX: gate.pathX ?? 0,
      posY: gate.pathY ?? 0,
      inputState: JSON.stringify(gate.input.map(i => i)), // 深拷贝
      outputState: JSON.stringify([gate.output]),
    }));

    const wires: any[] = [];
// 用于跟踪每个 gate 的输入端口使用情况
    const inputPortUsageMap: { [gateId: string]: boolean[] } = {};

    for (const fromGate of this.canvasGates) {
      if (!fromGate.connections) continue;

      for (const toId of fromGate.connections) {
        const toGate = this.canvasGates.find(g => g.id === toId);
        if (!toGate) continue;

        // 初始化该目标 gate 的端口使用情况
        if (!inputPortUsageMap[toGate.id]) {
          inputPortUsageMap[toGate.id] = new Array(toGate.input.length).fill(false);
        }

        // 找到第一个未被占用的输入端口
        const inputPorts = inputPortUsageMap[toGate.id];
        const availableIndex = inputPorts.findIndex(used => !used);

        if (availableIndex === -1) {
          console.warn(`目标门 ${toGate.name} 的所有输入端口都被占用了，跳过连接`);
          continue;
        }

        // 标记该端口为已用
        inputPorts[availableIndex] = true;

        // 添加线
        wires.push({
          fromTempId: fromGate.id,
          fromPortIndex: 0, // 假设都是单输出
          toTempId: toGate.id,
          signalValue: fromGate.output,
          toPortIndex: availableIndex
        });
      }
    }
    const payload = {
      userId: this.sharedService.userId,
      name: this.fileName,
      description: this.descriptionContent,
      components,
      wires,
    };

    console.log('📦 请求内容:', JSON.stringify(payload, null, 2));
    this.http.post('http://localhost:8080/webpj/circuits/simulate', payload).subscribe(
      (response:any)=>{
        if(response.code!=200){
          alert("计算失败：" + response.message);
        }else{}
        this.restoreFromJsonFromData(response.data);
      }
    );
  }
  onSingleRunButtonClicked() {
    if(this.isSingleRunMode){
        if(this.singleRunIndex < this.steps.length) {
          this.singleRun(this.steps[this.singleRunIndex]);
        }else{
          alert("已经执行完毕！")
        }
    }else{
      this.isSingleRunMode = true;
      const components = this.canvasGates.map((gate: Gate) => ({
        componentTypeId: gate.typeId,
        label: gate.name,
        tempId: gate.id,
        posX: gate.pathX ?? 0,
        posY: gate.pathY ?? 0,
        inputState: JSON.stringify(gate.input.map(i => i)), // 深拷贝
        outputState: JSON.stringify([gate.output]),
      }));

      const wires: any[] = [];
      // 用于跟踪每个 gate 的输入端口使用情况
      const inputPortUsageMap: { [gateId: string]: boolean[] } = {};

      for (const fromGate of this.canvasGates) {
        if (!fromGate.connections) continue;

        for (const toId of fromGate.connections) {
          const toGate = this.canvasGates.find(g => g.id === toId);
          if (!toGate) continue;

          // 初始化该目标 gate 的端口使用情况
          if (!inputPortUsageMap[toGate.id]) {
            inputPortUsageMap[toGate.id] = new Array(toGate.input.length).fill(false);
          }

          // 找到第一个未被占用的输入端口
          const inputPorts = inputPortUsageMap[toGate.id];
          const availableIndex = inputPorts.findIndex(used => !used);

          if (availableIndex === -1) {
            console.warn(`目标门 ${toGate.name} 的所有输入端口都被占用了，跳过连接`);
            continue;
          }

          // 标记该端口为已用
          inputPorts[availableIndex] = true;

          // 添加线
          wires.push({
            fromTempId: fromGate.id,
            fromPortIndex: 0, // 假设都是单输出
            toTempId: toGate.id,
            signalValue: fromGate.output,
            toPortIndex: availableIndex
          });
        }
      }
      const payload = {
        userId: this.sharedService.userId,
        name: this.fileName,
        description: this.descriptionContent,
        components,
        wires,
      };

      console.log('📦 请求内容:', JSON.stringify(payload, null, 2));
      this.http.post('http://localhost:8080/webpj/circuits/simulate', payload).subscribe(
        (response: any) => {
          const orderMap = new Map<string, number>();
          response.data.evaluationOrder.forEach((tempId: string, index: number) => {
            orderMap.set(tempId, index);
          });

          response.data.evaluationSteps.forEach((step: {
            label: string;
            componentTypeId: any;
            newInputState: any;
            newOutputState: any;
          }) => {
            const order = orderMap.get(step.label) ?? 0;
            this.steps.push({
              tempId: step.label,
              typeId: step.componentTypeId,
              newInput: step.newInputState,
              newOutput: step.newOutputState,
              order: order
            });
          });
          console.log(this.steps);
          this.singleRun(this.steps[0]);
        });
    }
    this.singleRunIndex++;
  }
// {
//   "tempId": "40",
//   "typeId": 3,
//   "newInput": [
//     0
//   ],
//   "newOutput": [
//     1
//   ],
//   "order": 2
// }

singleRun(step: EvaluationAnimationStep){
      for (const gate of this.canvasGates){
        if(Number(step.tempId) == gate.id){
          gate.input = step.newInput;
          gate.output = step.newOutput;
          if(gate.typeId==7){
            // @ts-ignore
            gate.output = gate.input;
          }
          this.selectedGates.push(gate);
        }
        // @ts-ignore
        for(const child of gate.connections){
          if(child == Number(step.tempId)){
            this.selectedGates.push(gate);
            let toGate:Gate;
            for(const gate1 of this.canvasGates){
              if(gate1.id == child){
                toGate = gate1;
              }
            }
            const x1 = (gate.pathX || 0) + 35;
            const y1 = (gate.pathY || 0) + 20;
            // @ts-ignore
            const x2 = (toGate.pathX || 0);
            // @ts-ignore
            const y2 = (toGate.pathY || 0) + 20;

            const d = `M ${x1} ${y1} L ${x2} ${y2}`;

            this.connectionPaths.push({d,color:"red"});
          }
        }
      }
  }
  constructor(private http:HttpClient, private route:ActivatedRoute, private sharedService:SharedService) {
  }

  restoreByCircuitId(id:number) {
    this.http.get<any>(`http://localhost:8080/webpj/circuits/load/${id}`).subscribe(
      response=>{
        if(response.code!=200){
          alert("加载历史文件失败："+response.message);
        }else{
          console.log(response);
          this.restoreFromJsonFromData(response.data);
        }
      }
    )
  }

  restoreFromJsonFromData(data : any){
    this.descriptionContent = data.description;
    const tempIdToGateMap = new Map<string, Gate>();
    let idCounter = 1;

    // 1. 转换 components 到 canvasGates
    this.canvasGates = data.components.map((comp: any) => {
      const input = JSON.parse(comp.inputState || '[]').map((v: any) => v ?? null);
      const outputArray = JSON.parse(comp.outputState || '[]');
      const output = outputArray.length > 0 ? outputArray[0] : 0;

      const icon = typeIdToIconMap[comp.componentTypeId] || 'default.png';

      const gate: Gate = {
        id: comp.tempId,
        typeId: comp.componentTypeId,
        name: comp.label,
        input: input,
        output: output,
        pathX: comp.posX,
        pathY: comp.posY,
        x:comp.posX,
        y:comp.posY,
        z: 1,
        showTruthTable: false,
        connections: [],
        icon: icon,
        inputSources: []
      };

      tempIdToGateMap.set(comp.tempId, gate);
      return gate;
    });

    // 2. 根据 wires 设置连接
    for (const wire of data.wires) {
      const fromGate = tempIdToGateMap.get(wire.fromTempId);
      const toGate = tempIdToGateMap.get(wire.toTempId);
      if (!fromGate || !toGate) continue;

      // 添加连接
      fromGate.connections!.push(toGate.id);
      console.log(fromGate.id+": "+ fromGate.connections)

      // 设置 input
      toGate.input[wire.toPortIndex] = wire.signalValue;
      toGate.inputSources!.push({ id: fromGate.id, value: wire.signalValue });
    }

    // 3. 更新连线渲染
    this.updateConnectionPaths();
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if(id!=0){
      this.circuitId = id;
      this.restoreByCircuitId(id);
    }
  }
}
