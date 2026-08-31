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
      {/* Glowing Ring */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 blur-md opacity-80 animate-pulse" />
      
      {/* App Logo Image with Frame */}
      <div className="relative w-full h-full rounded-2xl border-2 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.6)] overflow-hidden bg-slate-950 flex items-center justify-center p-0.5">
        <img
          src="/app_icon.png"
          alt="BD ESPORTS MS Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
    </div>
  );
};
