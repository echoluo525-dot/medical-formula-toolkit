import React, { useState } from 'react';
import { Formula } from './types';
import FormulaList from './components/FormulaList';
import Calculator from './components/Calculator';
import { Stethoscope, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div 
              className="flex items-center cursor-pointer group" 
              onClick={() => setSelectedFormula(null)}
            >
              <div className="bg-gradient-to-br from-[#2E86C1] to-[#2573a8] p-2 rounded-lg mr-3 shadow-md group-hover:shadow-lg transition-all">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                  医学公式<span className="text-[#2E86C1]">宝典</span>
                </h1>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">临床计算工具</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <a 
                href="#" 
                className="text-xs font-medium text-slate-400 hover:text-[#2E86C1] flex items-center gap-1.5 transition-colors bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100"
                onClick={(e) => e.preventDefault()}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">仅供医疗专业人士使用</span>
                <span className="sm:hidden">专业版</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {selectedFormula ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Calculator 
              formula={selectedFormula} 
              onBack={() => setSelectedFormula(null)} 
            />
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <div className="mb-8 border-b border-slate-200 pb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">常用临床公式</h2>
              <p className="text-slate-600 max-w-3xl leading-relaxed text-sm sm:text-base">
                专为中国医生打造的智能计算平台，涵盖肿瘤科、内科、外科及麻醉科常用公式。
                <span className="hidden sm:inline"> 集成AI辅助解读功能，提升临床决策效率。</span>
              </p>
            </div>
            <FormulaList onSelect={setSelectedFormula} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-xs text-slate-400 space-y-2">
            <p className="font-medium">
              © {new Date().getFullYear()} 医学公式宝典 (MedFormula Pro)
            </p>
            <p className="max-w-md mx-auto leading-relaxed">
              本工具仅作为临床辅助参考，不能替代医生的专业判断。使用前请独立核实计算结果。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;