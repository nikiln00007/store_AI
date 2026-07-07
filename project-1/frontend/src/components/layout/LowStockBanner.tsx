import React from 'react';
import { useStore } from '../../store/useStore.js';
import { AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  lowStockCount: number;
}

export const LowStockBanner: React.FC<Props> = ({ lowStockCount }) => {
  const { openAIModal, language } = useStore();
  const navigate = useNavigate();

  if (lowStockCount <= 0) return null;

  return (
    <div className="bg-gradient-to-r from-terracotta-500 via-saffron-500 to-terracotta-600 text-white rounded-2xl p-4 shadow-xl shadow-terracotta-500/20 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/20 relative overflow-hidden animate-float">
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="flex items-center gap-3.5 z-10">
        <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
          <AlertTriangle className="w-6 h-6 text-yellow-200 animate-bounce" />
        </div>
        <div>
          <h4 className="font-extrabold text-base tracking-tight flex items-center gap-2">
            {`Alert: ${lowStockCount} Items Below Min Stock Threshold! 🚨`}
          </h4>
          <p className="text-xs text-white/90 font-medium mt-0.5">
            {'Essential retail items require urgent replenishment.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto z-10">
        <button
          onClick={() => openAIModal('Reorder low stock items automatically')}
          className="flex-1 sm:flex-initial bg-white text-terracotta-700 hover:bg-cream font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-saffron-500" />
          <span>AI Auto-Reorder</span>
        </button>
        <button
          onClick={() => navigate('/inventory?lowStock=true')}
          className="bg-black/20 hover:bg-black/30 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1"
        >
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
