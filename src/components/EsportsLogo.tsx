import React from 'react';

interface EsportsLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const EsportsLogo: React.FC<EsportsLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Outer Golden Flare & Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-600 blur-md opacity-75 animate-pulse" />
      
      {/* Sunburst ray ring */}
      <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-yellow-500/40 via-amber-300/60 to-orange-500/40 blur-xs" />

      {/* Main Circular Shield */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-b from-amber-900 via-stone-900 to-black border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.6)] flex flex-col items-center justify-center p-2 overflow-hidden">
        {/* Background radial rays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/30 via-transparent to-black" />
        
        {/* Shield Frame Icon Graphic */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Top Text Arc */}
          <div className="text-[8px] sm:text-[10px] font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-orange-500 font-['Orbitron',sans-serif] leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] scale-y-110">
            BD ESPORTS
          </div>
          <div className="text-[8px] sm:text-[10px] font-extrabold tracking-widest uppercase text-amber-300 font-['Orbitron',sans-serif] -mt-0.5 leading-none">
            MS
          </div>

          {/* White & Gold Game Controller Graphic */}
          <div className="mt-1 relative">
            <svg
              className="w-7 h-7 sm:w-9 sm:h-9 text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Controller Body */}
              <rect x="2" y="6" width="20" height="12" rx="6" fill="#f8fafc" stroke="#d97706" strokeWidth="1.5" />
              {/* D-Pad */}
              <path d="M6 12h4m-2-2v4" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
              {/* Action Buttons */}
              <circle cx="15.5" cy="10.5" r="1" fill="#ef4444" />
              <circle cx="17.5" cy="12" r="1" fill="#3b82f6" />
              <circle cx="15.5" cy="13.5" r="1" fill="#eab308" />
              <circle cx="13.5" cy="12" r="1" fill="#22c55e" />
              {/* Grips */}
              <path d="M4 14l2 4M20 14l-2 4" stroke="#d97706" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Golden lower crest ribbon highlight */}
        <div className="absolute -bottom-2 w-16 h-4 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 rounded-full blur-[1px] opacity-70" />
      </div>
    </div>
  );
};
