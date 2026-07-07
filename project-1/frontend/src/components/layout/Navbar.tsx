import React from 'react';
import { useStore } from '../../store/useStore.js';
import { Store, UserCircle, LogOut, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout, openAIModal } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-terracotta-100 shadow-sm px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo & Brand */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-terracotta-500 to-saffron-500 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-charcoal">Store</span>
              <span className="bg-gradient-to-r from-terracotta-600 to-saffron-500 text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI
              </span>
            </div>
            <p className="text-[11px] font-medium text-forest-600 -mt-0.5 hidden sm:block">
              Smart Autonomous Business Assistant
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">

          {/* AI Quick Button (Mobile/Desktop) */}
          <button
            onClick={() => openAIModal()}
            className="flex items-center gap-1.5 bg-forest-50 hover:bg-forest-100 text-forest-700 font-semibold text-xs px-3 py-2 rounded-xl border border-forest-200 shadow-sm transition-all animate-pulse-slow"
          >
            <Sparkles className="w-4 h-4 text-golden" />
            <span className="hidden md:inline">AI Command Center</span>
            <span className="md:hidden">AI</span>
          </button>

          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-softgray">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-charcoal">{user.name}</div>
                <div className="text-[10px] font-medium text-terracotta-600">{user.shopName}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-forest-500 to-mint-400 flex items-center justify-center text-white font-bold shadow-md cursor-pointer">
                {user.name ? user.name.charAt(0) : 'R'}
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 text-charcoal/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
