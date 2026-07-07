import React from 'react';
import { useStore } from '../../store/useStore.js';
import { Language } from '../../types/index.js';
import { Languages } from 'lucide-react';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useStore();

  const langOptions: { code: Language; label: string }[] = [
    { code: 'hinglish', label: 'Hinglish (🇮🇳)' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'en', label: 'English' },
  ];

  return (
    <div className="flex items-center gap-1 bg-white/70 backdrop-blur-md border border-terracotta-200 rounded-full p-1 shadow-sm">
      <Languages className="w-4 h-4 text-terracotta-600 ml-2" />
      {langOptions.map((opt) => (
        <button
          key={opt.code}
          onClick={() => setLanguage(opt.code)}
          className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
            language === opt.code
              ? 'bg-gradient-to-r from-terracotta-500 to-saffron-500 text-white shadow-md'
              : 'text-charcoal/70 hover:text-charcoal hover:bg-terracotta-50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
