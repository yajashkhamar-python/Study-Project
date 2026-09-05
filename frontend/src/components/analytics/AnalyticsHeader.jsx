import React from 'react';
import { Calendar, BarChart2 } from 'lucide-react';

export const AnalyticsHeader = ({ activeRange, onRangeChange }) => {
  const ranges = [
    { id: '7days', label: 'Last 7 Days' },
    { id: '30days', label: 'Last 30 Days' },
    { id: '90days', label: 'Last 90 Days' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Student Performance Dashboard
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Comprehensive real-time analytics on study hours, task completion, focus sessions, and subject mastery.
        </p>
      </div>

      {/* Time Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-900/80 border border-slate-300/50 dark:border-slate-800/80 self-start md:self-auto">
        {ranges.map((r) => (
          <button
            key={r.id}
            onClick={() => onRangeChange(r.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
              activeRange === r.id
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-300/50 dark:hover:bg-slate-800/50'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
};
