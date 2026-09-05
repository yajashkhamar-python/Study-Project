import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Layers } from 'lucide-react';

export const WeeklyComparisonCard = ({ comparison }) => {
  const items = [
    {
      title: 'Study Time',
      current: `${Math.floor(comparison.studyTime.currentMinutes / 60)}h ${comparison.studyTime.currentMinutes % 60}m`,
      previous: `${Math.floor(comparison.studyTime.previousMinutes / 60)}h ${comparison.studyTime.previousMinutes % 60}m`,
      pct: comparison.studyTime.pctChange,
    },
    {
      title: 'Tasks Completed',
      current: comparison.tasksCompleted.currentCount,
      previous: comparison.tasksCompleted.previousCount,
      pct: comparison.tasksCompleted.pctChange,
    },
    {
      title: 'Focus Sessions',
      current: comparison.focusSessions.currentCount,
      previous: comparison.focusSessions.previousCount,
      pct: comparison.focusSessions.pctChange,
    },
  ];

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              Weekly Comparison
            </h3>
            <p className="text-[11px] text-slate-500">This Week vs Previous Week performance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {items.map((item) => {
          const isUp = item.pct > 0;
          const isDown = item.pct < 0;

          return (
            <div
              key={item.title}
              className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between"
            >
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                {item.title}
              </span>

              <div className="my-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {item.current}
                </span>

                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    isUp
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : isDown
                      ? 'bg-rose-500/15 text-rose-500'
                      : 'bg-slate-500/15 text-slate-400'
                  }`}
                >
                  {isUp && <ArrowUpRight className="w-3.5 h-3.5" />}
                  {isDown && <ArrowDownRight className="w-3.5 h-3.5" />}
                  {!isUp && !isDown && <Minus className="w-3.5 h-3.5" />}
                  {isUp ? `+${item.pct}%` : `${item.pct}%`}
                </span>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                Prev week: <strong>{item.previous}</strong>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
