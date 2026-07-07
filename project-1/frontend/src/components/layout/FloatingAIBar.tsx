import React, { useState } from 'react';
import { useStore } from '../../store/useStore.js';
import { Sparkles, Mic, Send, Volume2 } from 'lucide-react';

export const FloatingAIBar: React.FC = () => {
  const { openAIModal, language } = useStore();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  const suggestionChips = [
    { label: '📦 Order low stock items', prompt: 'Reorder low stock items automatically' },
    { label: '🧾 Create quick bill', prompt: 'Create instant bill for 2 Tata Salt and 1 Biscuit' },
    { label: '📊 Check monthly profit', prompt: 'Show my monthly profit report' },
    { label: '🔍 Find Parle-G stock', prompt: 'Find Parle-G stock' }
  ];

  const handleSend = (text?: string) => {
    const cmd = text || input;
    if (!cmd.trim()) return;
    openAIModal(cmd);
    setInput('');
  };

    const handleVoiceSim = () => {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        handleSend('Reorder low stock items automatically');
      }, 2000);
    };

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 left-4 md:left-72 md:right-8 z-30 pointer-events-none flex flex-col items-center">
      <div className="w-full max-w-3xl pointer-events-auto">
        {/* Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1 scrollbar-none">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.prompt)}
              className="bg-white/90 hover:bg-white text-charcoal font-semibold text-xs px-3.5 py-1.5 rounded-full border border-terracotta-200 shadow-md hover:shadow-lg hover:border-terracotta-400 transition-all whitespace-nowrap flex items-center gap-1.5 transform hover:-translate-y-0.5"
            >
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* Floating Glass Bar */}
        <div className="bg-[#1F2521]/95 text-white backdrop-blur-xl border border-white/15 shadow-2xl rounded-2xl p-2.5 flex items-center gap-2.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-terracotta-500">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-terracotta-500 to-saffron-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
            <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              isListening
                ? 'Listening... speak now! 🎙️'
                : 'Ask Store AI anything... e.g. "Order low stock", "Create quick bill"'
            }
            className="bg-transparent text-white placeholder-white/50 text-sm font-medium flex-1 outline-none px-2"
          />

          {/* Voice Input Sim Button */}
          <button
            onClick={handleVoiceSim}
            title="Voice Command (Simulation)"
            className={`p-2 rounded-xl transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
            }`}
          >
            {isListening ? <Volume2 className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className={`p-2 rounded-xl transition-all ${
              input.trim()
                ? 'bg-gradient-to-r from-terracotta-500 to-saffron-500 text-white shadow-md hover:scale-105'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
