// 工具相关类型定义

export interface Tool {
  id: string;
  name: string;
  description: string;
  path: string;
}

export interface Category {
  id: string;
  name: string;
  tools: Tool[];
}

export interface GradientStop {
  color: string;
  position: number;
}
