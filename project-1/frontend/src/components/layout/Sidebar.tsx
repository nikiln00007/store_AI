import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PackageSearch, Users, BarChart3, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore.js';

export const Sidebar: React.FC = () => {
  const { language } = useStore();

  const navItems = [
    {
      to: '/',
      icon: LayoutDashboard,
      label: 'Dashboard'
    },
    {
      to: '/billing',
      icon: Receipt,
      label: 'POS Billing & Invoice'
    },
    {
      to: '/inventory',
      icon: PackageSearch,
      label: 'Inventory Stock'
    },
    {
      to: '/suppliers',
      icon: Users,
      label: 'Smart Reordering'
    },
    {
      to: '/reports',
      icon: BarChart3,
      label: 'AI Reports & Ledger'
    }
  ];

  const getLabel = (item: typeof navItems[0]) => {
    return item.label;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-md border-r border-terracotta-100 min-h-[calc(100vh-65px)] p-4 shadow-sm sticky top-[65px]">
        <div className="space-y-1.5 flex-1">
          <div className="text-[11px] font-bold tracking-wider text-charcoal/40 uppercase px-3 mb-2">
            Main Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-terracotta-500 to-saffron-500 text-white shadow-lg shadow-terracotta-500/20 translate-x-1'
                      : 'text-charcoal/70 hover:bg-terracotta-50 hover:text-terracotta-700'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{getLabel(item)}</span>
              </NavLink>
            );
          })}
        </div>

        {/* AI Assistant Mini Card in Sidebar */}
        <div className="mt-auto bg-gradient-to-br from-forest-50 to-mint-50 border border-forest-200 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-forest-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
          <div className="flex items-center gap-2 text-forest-700 font-bold text-xs mb-1.5">
            <Sparkles className="w-4 h-4 text-golden animate-spin" style={{ animationDuration: '6s' }} />
            <span>24x7 Digital Assistant</span>
          </div>
          <p className="text-[11px] text-forest-800/80 leading-relaxed font-medium">
            "Need to create a bill or reorder stock? Just ask or type your command!" 🌿
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (PWA 2026 feel) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-terracotta-100 shadow-2xl px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-terracotta-600 scale-105 font-bold'
                    : 'text-charcoal/60 hover:text-terracotta-500 font-medium'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">{getLabel(item)}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
