import React from 'react';

interface HeaderProps {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, action }) => {
  // Make last word cyan
  const words = title.split(' ');
  const lastWord = words.pop();
  const start = words.join(' ');

  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-12">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-light tracking-tight">
          {start} <span className="text-neon-cyan font-bold">{lastWord}</span>
        </h1>
        <p className="text-white/40 text-xs uppercase tracking-wide font-medium mt-1">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        {/* Real-time Sync pill */}
        <div className="px-4 py-2 rounded-full glass-panel text-xs text-white/40 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
          Real-time Sync
        </div>
        {action}
      </div>
    </div>
  );
};

export default Header;
