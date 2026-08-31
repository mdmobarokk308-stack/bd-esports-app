import React from 'react';
import { ShoppingBag, Gamepad2, ClipboardList, TrendingUp, UserCircle2 } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  myMatchesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  myMatchesCount = 0,
}) => {
  const tabs = [
    {
      id: 'shop' as TabType,
      label: 'Shop',
      icon: ShoppingBag,
      activeColor: 'text-teal-600',
    },
    {
      id: 'play' as TabType,
      label: 'Play',
      icon: Gamepad2,
      activeColor: 'text-purple-700',
    },
    {
      id: 'my_matches' as TabType,
      label: 'My Matches',
      shortLabel: 'My Matc...',
      icon: ClipboardList,
      activeColor: 'text-amber-600',
      badge: myMatchesCount > 0 ? myMatchesCount : undefined,
    },
    {
      id: 'results' as TabType,
      label: 'Results',
      icon: TrendingUp,
      activeColor: 'text-emerald-600',
    },
    {
      id: 'profile' as TabType,
      label: 'Profile',
      icon: UserCircle2,
      activeColor: 'text-purple-600',
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="sticky bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'
              }`}
            >
              {/* Icon with active pill backdrop for Play or current tab */}
              <div
                className={`flex items-center justify-center transition-all ${
                  isActive
                    ? tab.id === 'play'
                      ? 'w-14 h-8 bg-purple-100 rounded-full text-purple-700'
                      : tab.id === 'profile'
                      ? 'w-14 h-8 bg-purple-100 rounded-full text-purple-600'
                      : 'w-14 h-8 bg-slate-100 rounded-full ' + tab.activeColor
                    : 'w-8 h-8 text-slate-500'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge !== undefined && (
                  <span className="absolute top-0 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Text label in clean modern font */}
              <span
                className={`font-rajdhani text-xs mt-0.5 tracking-wide transition-colors ${
                  isActive ? 'text-slate-900 font-extrabold' : 'text-slate-500 font-bold'
                }`}
              >
                {tab.shortLabel || tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
