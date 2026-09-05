import React, { useState } from 'react';
import { Award, Info, CheckCircle, Flame, Clock, AlertTriangle } from 'lucide-react';

export const ProductivityScoreCard = ({ scoreData }) => {
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);
  const { score, tier, breakdown } = scoreData;

  const getTierColor = (t) => {
    if (t === 'Exceptional') return 'from-emerald-500 to-teal-500 text-emerald-400 border-emerald-500/30';
    if (t === 'Great') return 'from-indigo-500 to-purple-500 text-indigo-400 border-indigo-500/30';
    if (t === 'Good') return 'from-amber-500 to-orange-500 text-amber-400 border-amber-500/30';
    return 'from-rose-500 to-red-500 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between relative overflow-hidden shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              Productivity Rating
            </h3>
            <p className="text-[11px] text-slate-500">Deterministic performance metric</p>
          </div>
        </div>

        <button
          onClick={() => setShowFormulaInfo(!showFormulaInfo)}
          className="p-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/60 text-slate-400 hover:text-indigo-400 transition-colors"
          title="Formula Breakdown"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Main Score & Ring */}
      <div className="flex items-center justify-around gap-4 py-2">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              className="stroke-slate-200 dark:stroke-slate-800 fill-none"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              className="stroke-indigo-500 fill-none transition-all duration-1000 ease-out"
              strokeWidth="10"
              strokeDasharray="314"
              strokeDashoffset={314 - (314 * score) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {score}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">/ 100</span>
          </div>
        </div>

        <div className="space-y-2 text-center sm:text-left">
          <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border bg-gradient-to-r ${getTierColor(tier)}`}>
            {tier} Rating
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs font-medium">
            Calculated deterministically from task completion rate, daily focus targets, streak consistency, and overdue items.
          </p>
        </div>
      </div>

      {/* Score Formula Info Drawer */}
      {showFormulaInfo && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2 text-slate-300 animate-fadeIn">
          <div className="font-bold text-white mb-1 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-indigo-400" /> Score Formula Breakdown:
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Tasks Completion (35 max): <strong>{breakdown.taskCompletionPts} pts</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Focus Target (25 max): <strong>{breakdown.focusTargetPts} pts</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Streak Consistency (20 max): <strong>{breakdown.streakPts} pts</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Overdue Penalty (-15 max): <strong>-{breakdown.overduePenalty} pts</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
