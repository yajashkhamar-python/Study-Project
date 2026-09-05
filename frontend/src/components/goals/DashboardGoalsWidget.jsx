import React from 'react';
import { Target, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardGoalsWidget = ({ goals = [] }) => {
  const activeGoals = goals
    .filter((g) => g.status === 'In Progress' || g.status === 'Not Started')
    .slice(0, 3);

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              Active Goals & Milestones
            </h3>
            <p className="text-[11px] text-slate-500">Track your current academic progress</p>
          </div>
        </div>

        <Link
          to="/goals"
          className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {activeGoals.length === 0 ? (
        <div className="text-center py-6 space-y-2">
          <Target className="w-8 h-8 text-slate-400 opacity-50 mx-auto" />
          <p className="text-xs text-slate-500 font-medium">No active goals yet.</p>
          <Link
            to="/goals"
            className="inline-block px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            + Create Goal
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {activeGoals.map((goal) => (
            <Link
              key={goal._id}
              to="/goals"
              className="block p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 hover:border-indigo-500/40 transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors truncate max-w-[200px]">
                  {goal.title}
                </span>
                <span className="font-mono text-indigo-500 font-black">{goal.progress || 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${goal.progress || 0}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
