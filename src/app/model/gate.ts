export interface Gate {
  id: number;
  typeId: number;
  name: string;
  input: number[];
  output: number;
  x?: number;
  pathX?:number;
  y?: number;
  pathY?:number;
  z?: number; // 控制显示层级
  showTruthTable?: boolean; // 控制是否显示真值表
  connections?: number[]; // 添加连接信息
  icon?: string;
  inputSources?: { id: number; value: number }[]; // 跟踪input来源，确保输入的数组正确
}

