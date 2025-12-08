export enum FormulaCategory {
  ONCOLOGY = '肿瘤科',
  GENERAL = '内科/全科',
  SURGERY = '外科',
  ANESTHESIOLOGY = '麻醉科',
  NEPHROLOGY = '肾内科',
  CARDIOLOGY = '心内科',
  LAB = '检验科'
}

export enum InputType {
  NUMBER = 'number',
  SELECT = 'select',
  BOOLEAN = 'boolean'
}

export interface InputOption {
  label: string;
  value: number | string;
}

export interface FormulaInput {
  id: string;
  label: string;
  type: InputType;
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  options?: InputOption[];
  defaultValue?: number | string;
  description?: string;
}

export interface CalculationResult {
  value: number | string;
  unit?: string;
  interpretation?: string;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'orange';
}

export interface Formula {
  id: string;
  title: string;
  description: string;
  category: FormulaCategory;
  inputs: FormulaInput[];
  calculate: (values: Record<string, any>) => CalculationResult;
  reference?: string;
}