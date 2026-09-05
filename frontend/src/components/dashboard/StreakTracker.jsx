import React from 'react';
import { Flame } from 'lucide-react';

export const StreakTracker = ({ streak = 0 }) => {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl glass-card border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 text-white">
        <Flame className="w-6 h-6 animate-pulse" />
      </div>
      <div>
        <div className="text-xs uppercase font-extrabold tracking-wider text-amber-600 dark:text-amber-400">
          Current Study Streak
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
          {streak} {streak === 1 ? 'Day' : 'Days'} 🔥
        </div>
      </div>
    </div>
  );
};
