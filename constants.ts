import { Formula, FormulaCategory, InputType } from './types';

export const FORMULAS: Formula[] = [
  // --- ONCOLOGY ---
  {
    id: 'bsa',
    title: '体表面积计算 (Du Bois)',
    description: '化疗药物剂量计算的金标准公式 (BSA)。',
    category: FormulaCategory.ONCOLOGY,
    reference: 'Du Bois D, Du Bois EF. Arch Intern Med. 1916.',
    inputs: [
      { id: 'height', label: '身高', type: InputType.NUMBER, unit: 'cm', min: 0, max: 300, placeholder: '例如: 175' },
      { id: 'weight', label: '体重', type: InputType.NUMBER, unit: 'kg', min: 0, max: 500, placeholder: '例如: 70' },
    ],
    calculate: (values) => {
      const h = Number(values.height);
      const w = Number(values.weight);
      if (!h || !w) return { value: '---' };
      const bsa = 0.007184 * Math.pow(w, 0.425) * Math.pow(h, 0.725);
      return { value: bsa.toFixed(2), unit: 'm²', color: 'blue' };
    },
  },
  {
    id: 'calvert',
    title: '卡铂剂量计算 (Calvert公式)',
    description: '根据目标AUC和肾小球滤过率计算卡铂剂量。',
    category: FormulaCategory.ONCOLOGY,
    reference: 'Calvert AH, et al. J Clin Oncol. 1989.',
    inputs: [
      { id: 'auc', label: '目标 AUC', type: InputType.NUMBER, unit: 'mg/mL/min', defaultValue: 5, placeholder: '通常为 4-6' },
      { id: 'gfr', label: 'GFR (或肌酐清除率)', type: InputType.NUMBER, unit: 'mL/min', placeholder: '测量或估算值' },
      { 
        id: 'cap', 
        label: '限制 GFR 上限为 125?', 
        type: InputType.SELECT, 
        options: [{label: '是 (推荐)', value: 'yes'}, {label: '否', value: 'no'}],
        defaultValue: 'yes',
        description: '为避免剂量过大，通常将GFR上限设为125 mL/min'
      }
    ],
    calculate: (values) => {
      const auc = Number(values.auc);
      let gfr = Number(values.gfr);
      const cap = values.cap === 'yes';
      
      if (!auc || !gfr) return { value: '---' };
      
      if (cap && gfr > 125) gfr = 125;
      
      const dose = auc * (gfr + 25);
      return { value: Math.round(dose), unit: 'mg', color: 'blue', interpretation: '总剂量 (Total Dose)' };
    },
  },
  {
    id: 'tumor_bed',
    title: '生物等效剂量 (BED)',
    description: '用于比较不同放疗分割方案的生物学效应。',
    category: FormulaCategory.ONCOLOGY,
    reference: 'Fowler JF. Br J Radiol. 1989.',
    inputs: [
      { id: 'total_dose', label: '总剂量 (D)', type: InputType.NUMBER, unit: 'Gy', placeholder: '例如: 50' },
      { id: 'fractions', label: '分割次数 (n)', type: InputType.NUMBER, unit: '次', placeholder: '例如: 25' },
      { id: 'alpha_beta', label: 'α/β 比值', type: InputType.NUMBER, unit: 'Gy', defaultValue: 10, description: '肿瘤通常为10，晚期反应组织为3' },
    ],
    calculate: (values) => {
      const D = Number(values.total_dose);
      const n = Number(values.fractions);
      const ab = Number(values.alpha_beta);
      
      if (!D || !n || !ab) return { value: '---' };
      
      const d = D / n; // 单次剂量
      const bed = D * (1 + (d / ab));
      
      return { value: bed.toFixed(2), unit: 'Gy', color: 'blue', interpretation: `单次剂量: ${d.toFixed(2)} Gy` };
    },
  },
  {
    id: 'tumor_doubling',
    title: '肿瘤倍增时间 (Doubling Time)',
    description: '基于两次测量估算肿瘤生长速度。',
    category: FormulaCategory.ONCOLOGY,
    reference: 'Schwartz M. Cancer. 1961.',
    inputs: [
      { id: 'd1', label: '初始直径 (D1)', type: InputType.NUMBER, unit: 'cm/mm', placeholder: '第一次测量值' },
      { id: 'd2', label: '最终直径 (D2)', type: InputType.NUMBER, unit: 'cm/mm', placeholder: '第二次测量值' },
      { id: 'days', label: '时间间隔', type: InputType.NUMBER, unit: '天', placeholder: '两次检查间隔天数' },
    ],
    calculate: (values) => {
      const v1 = Number(values.d1); 
      const v2 = Number(values.d2);
      const t = Number(values.days);
      
      if (!v1 || !v2 || !t || v2 <= v1) return { value: '---' };
      
      // DT = (T * log2) / (3 * log(D2/D1)) (假设球体体积计算)
      const doublingTime = (t * Math.log(2)) / (3 * Math.log(v2/v1));
      
      let interp = '生长缓慢';
      let color: 'green' | 'red' | 'yellow' | 'orange' = 'green';
      
      if (doublingTime < 30) { interp = '极速生长 (高危)'; color = 'red'; }
      else if (doublingTime < 100) { interp = '快速生长'; color = 'orange'; }
      
      return { 
        value: doublingTime.toFixed(1), 
        unit: '天', 
        interpretation: interp,
        color: color
      };
    },
  },

  // --- GENERAL INTERNAL ---
  {
    id: 'bmi',
    title: '身体质量指数 (BMI)',
    description: '评估成人体重状况的常用指标。',
    category: FormulaCategory.GENERAL,
    reference: 'WHO / 中国成人超重和肥胖预防控制指南',
    inputs: [
      { id: 'weight', label: '体重', type: InputType.NUMBER, unit: 'kg' },
      { id: 'height', label: '身高', type: InputType.NUMBER, unit: 'm', placeholder: '例如: 1.75' },
    ],
    calculate: (values) => {
      const w = Number(values.weight);
      const h = Number(values.height);
      if(!w || !h) return { value: '---' };
      
      const bmi = w / (h * h);
      let interp = '体重正常';
      let color: 'green' | 'red' | 'yellow' | 'orange' = 'green';
      
      // 使用中国标准
      if (bmi < 18.5) { interp = '体重过低'; color = 'yellow'; }
      else if (bmi >= 28) { interp = '肥胖'; color = 'red'; }
      else if (bmi >= 24) { interp = '超重'; color = 'orange'; }
      
      return { value: bmi.toFixed(1), unit: 'kg/m²', interpretation: interp, color };
    }
  },
  {
    id: 'child_pugh',
    title: 'Child-Pugh 肝功能分级',
    description: '评估肝硬化患者预后及手术风险。',
    category: FormulaCategory.GENERAL,
    reference: 'Child CG, Turcotte JG. 1964.',
    inputs: [
      { id: 'bili', label: '总胆红素', type: InputType.NUMBER, unit: 'mg/dL', description: '注: 1 mg/dL ≈ 17.1 µmol/L' },
      { id: 'alb', label: '白蛋白', type: InputType.NUMBER, unit: 'g/dL', description: '注: 1 g/dL = 10 g/L' },
      { id: 'inr', label: '凝血酶原时间 INR', type: InputType.NUMBER },
      { id: 'ascites', label: '腹水', type: InputType.SELECT, options: [
        {label: '无', value: 1}, {label: '轻度 / 易控制', value: 2}, {label: '中重度 / 难控制', value: 3}
      ]},
      { id: 'enceph', label: '肝性脑病', type: InputType.SELECT, options: [
        {label: '无', value: 1}, {label: '1-2 级 (轻度)', value: 2}, {label: '3-4 级 (重度)', value: 3}
      ]}
    ],
    calculate: (values) => {
      const bili = Number(values.bili);
      const alb = Number(values.alb);
      const inr = Number(values.inr);
      let score = Number(values.ascites) + Number(values.enceph);
      
      if (!bili || !alb || !inr || !values.ascites || !values.enceph) return { value: '---' };
      
      // Bili points
      if (bili < 2) score += 1;
      else if (bili <= 3) score += 2;
      else score += 3;
      
      // Albumin points
      if (alb > 3.5) score += 1;
      else if (alb >= 2.8) score += 2;
      else score += 3;
      
      // INR points
      if (inr < 1.7) score += 1;
      else if (inr <= 2.3) score += 2;
      else score += 3;
      
      let interp = 'A级 (预后良好)';
      let color: 'green' | 'red' | 'orange' = 'green';
      if (score >= 10) { interp = 'C级 (预后差)'; color = 'red'; }
      else if (score >= 7) { interp = 'B级 (需谨慎)'; color = 'orange'; }
      
      return { value: score, unit: '分', interpretation: interp, color };
    }
  },

  // --- SURGERY & ANESTHESIA ---
  {
    id: 'parkland',
    title: '烧伤补液公式 (Parkland)',
    description: '大面积烧伤患者最初24小时液体复苏量计算。',
    category: FormulaCategory.SURGERY,
    reference: 'Baxter CR. 1974.',
    inputs: [
      { id: 'tbsa', label: '烧伤总面积 (TBSA)', type: InputType.NUMBER, unit: '%', max: 100 },
      { id: 'weight', label: '体重', type: InputType.NUMBER, unit: 'kg' },
    ],
    calculate: (values) => {
      const tbsa = Number(values.tbsa);
      const w = Number(values.weight);
      
      if (!tbsa || !w) return { value: '---' };
      
      const volume = 4 * w * tbsa;
      
      return { 
        value: volume.toLocaleString(), 
        unit: 'mL / 24小时', 
        interpretation: `前8小时输注: ${Math.round(volume/2)} mL`,
        color: 'blue' 
      };
    },
  },
  {
    id: 'ibw',
    title: '理想体重 (IBW)',
    description: '基于身高和性别计算理想体重 (Devine公式)。',
    category: FormulaCategory.ANESTHESIOLOGY,
    reference: 'Devine BJ. 1974.',
    inputs: [
      { id: 'gender', label: '性别', type: InputType.SELECT, options: [{label: '男性', value: 'm'}, {label: '女性', value: 'f'}], defaultValue: 'm' },
      { id: 'height_cm', label: '身高', type: InputType.NUMBER, unit: 'cm', min: 140 }, 
    ],
    calculate: (values) => {
      const h = Number(values.height_cm);
      const isMale = values.gender === 'm';
      
      if (!h) return { value: '---' };
      
      // Height in inches over 5ft (60 inches)
      const h_inches = h / 2.54;
      const feet_over = h_inches - 60;
      
      if (feet_over < 0) return { value: 'N/A', interpretation: '身高需 > 152cm' };
      
      const base = isMale ? 50 : 45.5;
      const ibw = base + (2.3 * feet_over);
      
      return { value: ibw.toFixed(1), unit: 'kg', color: 'blue' };
    },
  },

  // --- LAB ---
  {
    id: 'glucose_conv',
    title: '血糖单位换算',
    description: '在 mg/dL 和 mmol/L 之间进行快速换算。',
    category: FormulaCategory.LAB,
    reference: '',
    inputs: [
      { id: 'val', label: '数值', type: InputType.NUMBER },
      { id: 'direction', label: '换算方向', type: InputType.SELECT, options: [
        {label: 'mg/dL 转 mmol/L', value: 'to_mmol'},
        {label: 'mmol/L 转 mg/dL', value: 'to_mg'}
      ], defaultValue: 'to_mmol'}
    ],
    calculate: (values) => {
      const v = Number(values.val);
      const dir = values.direction;
      if (!v) return { value: '---' };
      
      if (dir === 'to_mmol') {
        return { value: (v / 18).toFixed(2), unit: 'mmol/L', color: 'blue' };
      } else {
        return { value: (v * 18).toFixed(0), unit: 'mg/dL', color: 'blue' };
      }
    }
  },

  // --- NEPHROLOGY / CARDIO ---
  {
    id: 'cockcroft',
    title: '肌酐清除率 (Cockcroft-Gault)',
    description: '估算肾小球滤过率(eGFR)的经典公式。',
    category: FormulaCategory.NEPHROLOGY,
    reference: 'Cockcroft DW, Gault MH. Nephron. 1976.',
    inputs: [
      { id: 'gender', label: '性别', type: InputType.SELECT, options: [{label:'男性', value: 1}, {label:'女性', value: 0.85}], defaultValue: 1 },
      { id: 'age', label: '年龄', type: InputType.NUMBER, unit: '岁' },
      { id: 'weight', label: '体重', type: InputType.NUMBER, unit: 'kg' },
      { id: 'creatinine', label: '血肌酐', type: InputType.NUMBER, unit: 'mg/dL' },
    ],
    calculate: (values) => {
      const age = Number(values.age);
      const weight = Number(values.weight);
      const cr = Number(values.creatinine);
      const factor = Number(values.gender);
      
      if (!age || !weight || !cr) return { value: '---' };
      
      // ((140 - age) * weight) / (72 * Cr) * factor
      const crcl = ((140 - age) * weight) / (72 * cr) * factor;
      return { value: crcl.toFixed(1), unit: 'mL/min', color: 'blue' };
    },
  },
  {
    id: 'map',
    title: '平均动脉压 (MAP)',
    description: '反映心动周期中动脉内的平均压力。',
    category: FormulaCategory.CARDIOLOGY,
    reference: '',
    inputs: [
      { id: 'sbp', label: '收缩压 (高压)', type: InputType.NUMBER, unit: 'mmHg' },
      { id: 'dbp', label: '舒张压 (低压)', type: InputType.NUMBER, unit: 'mmHg' },
    ],
    calculate: (values) => {
      const s = Number(values.sbp);
      const d = Number(values.dbp);
      if (!s || !d) return { value: '---' };
      
      const map = d + (1/3) * (s - d);
      return { value: map.toFixed(0), unit: 'mmHg', color: 'blue' };
    }
  }
];