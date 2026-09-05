import React from 'react';
import { Timer, Zap, Calendar, Award } from 'lucide-react';

export const FocusAnalyticsSection = ({ focusAnalytics }) => {
  const {
    totalFocusMinutes,
    completedSessionsCount,
    averageSessionDurationMins,
    longestSessionMins,
    focusSessionsToday,
    focusTimeTodayMins,
    focusSessionsThisWeek,
    focusTimeThisWeekMins,
    mostProductiveDay,
    weekdayBreakdown,
  } = focusAnalytics;

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              Focus & Pomodoro Analytics
            </h3>
            <p className="text-[11px] text-slate-500">Focus session metrics & productive day analysis</p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Focus Time</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {Math.floor(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Avg Duration</span>
          <div className="text-xl font-black text-indigo-500 mt-1">
            {averageSessionDurationMins} mins
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Longest Session</span>
          <div className="text-xl font-black text-purple-500 mt-1">
            {longestSessionMins} mins
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Sessions Today</span>
          <div className="text-xl font-black text-emerald-500 mt-1">
            {focusSessionsToday} ({focusTimeTodayMins}m)
          </div>
        </div>
      </div>

      {/* Productive Day Analysis */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-slate-900/40 border border-indigo-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
              Most Productive Day: <span className="text-indigo-400 font-black">{mostProductiveDay}</span>
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Weekly Focus Distribution</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 pt-2 text-center">
          {weekdayBreakdown.map((w) => {
            const isMax = w.day === mostProductiveDay;
            return (
              <div
                key={w.day}
                className={`p-2.5 rounded-xl border transition-all ${
                  isMax
                    ? 'bg-gradient-to-b from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-md scale-105'
                    : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-300/30 dark:border-slate-800'
                }`}
              >
                <div className="text-[11px] font-black">{w.day}</div>
                <div className="text-xs font-extrabold mt-1">{w.totalMinutes}m</div>
                <div className="text-[9px] opacity-75">{w.sessionCount} sesh</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
