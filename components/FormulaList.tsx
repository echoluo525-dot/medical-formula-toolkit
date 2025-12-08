import React, { useState, useMemo } from 'react';
import { FORMULAS } from '../constants';
import { Formula, FormulaCategory } from '../types';
import { Search, ChevronRight, Activity, Beaker, HeartPulse, Stethoscope, Scissors, Syringe, TestTube } from 'lucide-react';

interface FormulaListProps {
  onSelect: (formula: Formula) => void;
}

const FormulaList: React.FC<FormulaListProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  const categories = ['全部', ...Object.values(FormulaCategory)];

  const filteredFormulas = useMemo(() => {
    return FORMULAS.filter(f => {
      const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            f.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === '全部' || f.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const getIcon = (cat: FormulaCategory) => {
    switch (cat) {
      case FormulaCategory.ONCOLOGY: return <Beaker className="w-5 h-5 text-[#2E86C1]" />;
      case FormulaCategory.CARDIOLOGY: return <HeartPulse className="w-5 h-5 text-red-500" />;
      case FormulaCategory.NEPHROLOGY: return <Activity className="w-5 h-5 text-[#F39C12]" />;
      case FormulaCategory.SURGERY: return <Scissors className="w-5 h-5 text-slate-600" />;
      case FormulaCategory.ANESTHESIOLOGY: return <Syringe className="w-5 h-5 text-emerald-500" />;
      case FormulaCategory.LAB: return <TestTube className="w-5 h-5 text-purple-500" />;
      default: return <Stethoscope className="w-5 h-5 text-[#2E86C1]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="搜索公式 (例如: BSA, GFR, 补液...)" 
            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent bg-white shadow-sm transition-all text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border flex-shrink-0 ${
                selectedCategory === cat 
                  ? 'bg-[#2E86C1] text-white border-[#2E86C1] shadow-md' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
        {filteredFormulas.map(formula => (
          <div 
            key={formula.id}
            onClick={() => onSelect(formula)}
            className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-[#2E86C1]/50 cursor-pointer transition-all duration-200 flex flex-col justify-between relative overflow-hidden active:scale-[0.98]"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 group-hover:bg-[#2E86C1] transition-colors"></div>
            <div>
              <div className="flex items-start justify-between mb-3 pl-3">
                <div className="p-2.5 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                  {getIcon(formula.category)}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-500">
                  {formula.category}
                </span>
              </div>
              <div className="pl-3">
                <h3 className="font-bold text-lg text-slate-800 mb-1.5 group-hover:text-[#2E86C1] transition-colors">
                  {formula.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                  {formula.description}
                </p>
              </div>
            </div>
            <div className="mt-5 pl-3 flex items-center justify-end text-[#2E86C1] text-sm font-semibold">
               <span className="group-hover:mr-2 transition-all">开始计算</span> 
               <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        ))}
        
        {filteredFormulas.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium">未找到相关公式</p>
            <p className="text-sm mt-1">请尝试更换关键词或分类</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormulaList;