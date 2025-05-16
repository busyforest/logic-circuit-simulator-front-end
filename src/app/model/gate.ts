export interface Gate {
  id: number;
  name: string;
  input: number;
  output: number;
  x?: number;
  y?: number;
  z?: number; // 控制显示层级
  showTruthTable?: boolean; // 控制是否显示真值表
}
