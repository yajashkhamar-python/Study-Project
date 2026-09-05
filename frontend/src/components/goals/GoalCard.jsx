import React from 'react';
import { Target, Calendar, CheckCircle2, AlertCircle, Clock, ChevronRight } from 'lucide-react';

export const GoalCard = ({ goal, onViewDetails }) => {
  const {
    title,
    description,
    category,
    priority,
    status,
    targetDate,
    progress = 0,
    completedMilestones = 0,
    totalMilestones = 0,
  } = goal;

  const getPriorityColor = (p) => {
    switch (p) {
      case 'high':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'medium':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'low':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'Completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'In Progress':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';
      case 'Overdue':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'Paused':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
      default:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    }
  };

  const formattedDate = targetDate
    ? new Date(targetDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No Date';

  return (
    <div className="glass-card-hover p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] shadow-lg group relative overflow-hidden">
      {/* Background ambient accent tint */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {category || 'Academic'}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getPriorityColor(priority)}`}>
              {priority} priority
            </span>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(status)}`}>
            {status}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 font-medium">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Progress & Milestone Section */}
      <div className="my-5 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
            {totalMilestones > 0 ? `${completedMilestones} / ${totalMilestones} Milestones` : 'No Milestones'}
          </span>
          <span className="font-mono font-black text-indigo-500">{progress}%</span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer & Action */}
      <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Due: {formattedDate}</span>
        </div>

        <button
          onClick={() => onViewDetails(goal)}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 transition-all duration-200"
        >
          <span>View Goal</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
