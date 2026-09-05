import React from 'react';

export const Badge = ({ children, variant = 'default', className = '', showDot = true }) => {
  const variants = {
    default: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20 backdrop-blur-sm',
    pending: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 backdrop-blur-sm',
    'in-progress': 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 backdrop-blur-sm',
    completed: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 backdrop-blur-sm',
    overdue: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 backdrop-blur-sm',
    low: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
    medium: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    high: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
    urgent: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold border-rose-500/40 shadow-sm shadow-rose-500/20 animate-pulse',
  };

  const dotColors = {
    default: 'bg-slate-400',
    pending: 'bg-amber-400',
    'in-progress': 'bg-sky-400',
    completed: 'bg-emerald-400',
    overdue: 'bg-rose-400',
    low: 'bg-slate-400',
    medium: 'bg-indigo-400',
    high: 'bg-orange-400',
    urgent: 'bg-rose-500',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${variants[variant] || variants.default} ${className}`}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.default}`} />
      )}
      {children}
    </span>
  );
};

