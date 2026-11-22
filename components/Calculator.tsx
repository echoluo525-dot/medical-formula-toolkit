import React, { useState, useEffect } from 'react';
import { Formula, InputType } from '../types';
import { ArrowLeft, RefreshCw, Info, Sparkles, ChevronDown, KeyRound } from 'lucide-react';
import { getApiKey, setApiKey, hasApiKey } from '../services/aiKey';

interface CalculatorProps {
  formula: Formula;
  onBack: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ formula, onBack }) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const [keyDraft, setKeyDraft] = useState(getApiKey());
  const [keyReady, setKeyReady] = useState(hasApiKey());

  useEffect(() => {
    // Scroll to top when formula opens
    window.scrollTo(0, 0);
    const defaults: Record<string, any> = {};
    formula.inputs.forEach(input => {
      if (input.defaultValue !== undefined) {
        defaults[input.id] = input.defaultValue;
      }
    });
    setValues(defaults);
    setResult(null);
    setAiExplanation(null);
    setShowKeyPanel(false);
  }, [formula]);

  useEffect(() => {
    const res = formula.calculate(values);
    setResult(res);
  }, [values, formula]);

  const handleChange = (id: string, value: any) => {
    setValues(prev => ({ ...prev, [id]: value }));
    setAiExplanation(null);
  };

  const handleAskAI = async () => {
    if (!result || result.value === '---') return;

    // 没有 Key 就先让访客填一次，不静默失败
    if (!hasApiKey()) {
      setShowKeyPanel(true);
      return;
    }

    setAiLoading(true);
    // 按需加载：@google/genai 只在真正要解读时才下载，首屏不为它付代价
    const { getClinicalExplanation } = await import('../services/geminiService');
    const explanation = await getClinicalExplanation(
      formula.title,
      formula.description,
      formula.inputs.map(input => ({ label: input.label, value: values[input.id] })),
      result.value,
      result.unit
    );
    setAiExplanation(explanation);
    setAiLoading(false);
  };

  const saveKey = () => {
    if (!keyDraft.trim()) return;
    setApiKey(keyDraft);
    setKeyReady(true);
    setShowKeyPanel(false);
    void handleAskAI();
  };

  const getResultColorClass = (color?: string) => {
    switch(color) {
      case 'green': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'yellow': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'orange': return 'text-[#F39C12] bg-orange-50 border-orange-200';
      case 'red': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-[#2E86C1] bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-[#2E86C1] transition-colors active:scale-95 px-2 py-1 -ml-2 rounded-lg"
      >
        <ArrowLeft className="w-5 h-5 mr-1" /> 返回列表
      </button>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{formula.title}</h2>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">{formula.description}</p>
            </div>
            <div className="bg-[#2E86C1]/10 text-[#2E86C1] px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide whitespace-nowrap">
              {formula.category}
            </div>
          </div>
        </div>

        <div className="p-5 md:p-8 grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Inputs */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">输入参数</h3>
              <button 
                onClick={() => setValues({})} 
                className="flex items-center text-xs text-[#2E86C1] font-medium hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> 重置
              </button>
            </div>
            
            {formula.inputs.map(input => (
              <div key={input.id} className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {input.label}
                  {input.unit && <span className="text-slate-400 font-normal ml-1">({input.unit})</span>}
                </label>
                
                {input.type === InputType.SELECT ? (
                  <div className="relative">
                    <select
                      value={values[input.id] || ''}
                      onChange={(e) => handleChange(input.id, e.target.value)}
                      className="block w-full rounded-xl border-slate-300 bg-slate-50 border px-4 py-3.5 text-slate-900 focus:border-[#2E86C1] focus:ring-[#2E86C1] text-base appearance-none outline-none transition-all focus:ring-1"
                    >
                      {!input.defaultValue && <option value="">请选择...</option>}
                      {input.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                ) : (
                  <input
                    type="number"
                    placeholder={input.placeholder || "0"}
                    value={values[input.id] || ''}
                    onChange={(e) => handleChange(input.id, e.target.value)}
                    className="block w-full rounded-xl border-slate-300 bg-slate-50 border px-4 py-3.5 text-slate-900 focus:border-[#2E86C1] focus:ring-[#2E86C1] text-base transition-all focus:ring-1 outline-none placeholder:text-slate-300"
                  />
                )}
                {input.description && <p className="mt-2 text-xs text-slate-400 leading-snug">{input.description}</p>}
              </div>
            ))}
          </div>

          {/* Results Area */}
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">计算结果</h3>
            <div className={`rounded-2xl p-8 border flex flex-col items-center text-center transition-all shadow-sm ${
              result && result.value !== '---' 
                ? getResultColorClass(result.color) 
                : 'border-dashed border-slate-300 bg-slate-50 text-slate-400'
            }`}>
              
              <div className="flex items-baseline justify-center gap-2 my-2">
                <span className="text-5xl font-bold tracking-tight">
                  {result ? result.value : '---'}
                </span>
                {result && result.unit && (
                  <span className="text-lg font-medium opacity-80">{result.unit}</span>
                )}
              </div>

              {result && result.interpretation && (
                <div className="mt-4 text-sm font-bold px-4 py-2 bg-white/60 rounded-lg border border-black/5 shadow-sm inline-block">
                  {result.interpretation}
                </div>
              )}
            </div>

            {/* AI Action */}
            <div className="mt-6 flex-1 flex flex-col justify-end">
              {showKeyPanel && (
                <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
                    <KeyRound className="w-3.5 h-3.5" /> 需要你自己的 Gemini API Key
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-amber-800">
                    本站是纯静态页面，不保存任何服务端密钥。填入自己的 Key 后才能调用 AI，
                    Key 只存在这台设备的浏览器里。
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="ml-1 underline decoration-amber-400 underline-offset-2 hover:text-amber-900"
                    >
                      去获取一枚
                    </a>
                  </p>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="password"
                      value={keyDraft}
                      onChange={e => setKeyDraft(e.target.value)}
                      placeholder="AIza..."
                      className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={saveKey}
                      className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                    >
                      保存并解读
                    </button>
                  </div>
                </div>
              )}
              {!aiExplanation ? (
                <button
                  onClick={handleAskAI}
                  disabled={!result || result.value === '---' || aiLoading}
                  className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all transform active:scale-[0.98] ${
                    !result || result.value === '---' 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#2E86C1] to-[#2573a8] text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" /> 分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> AI 临床智能解读
                      {!keyReady && <span className="text-[11px] font-normal opacity-80">（需自带 Key）</span>}
                    </>
                  )}
                </button>
              ) : (
                <div className="bg-slate-800 text-slate-50 p-6 rounded-xl text-sm leading-7 shadow-xl animate-fade-in relative mt-2">
                   <div className="flex items-center gap-2 mb-3 text-[#2E86C1] font-bold text-xs uppercase tracking-wider bg-slate-900/80 p-1.5 rounded w-fit border border-slate-700">
                      <Sparkles className="w-3 h-3" /> AI 深度分析
                   </div>
                   <div className="prose prose-invert prose-sm max-w-none">
                     {aiExplanation.split('\n').map((line, i) => (
                       <p key={i} className="mb-2 last:mb-0">{line}</p>
                     ))}
                   </div>
                   <div className="mt-4 text-[10px] text-slate-500 border-t border-slate-700 pt-3 flex items-center justify-between">
                     <span>*AI生成内容仅供参考</span>
                     <span className="opacity-50">Gemini 2.5 Flash</span>
                   </div>
                </div>
              )}
            </div>
            
            {formula.reference && (
               <div className="mt-8 text-center">
                 <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                   <Info className="w-3 h-3" />
                   参考文献: {formula.reference}
                 </p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;