import React from 'react';
import { Clock, CheckCircle2, Flame, Timer, GraduationCap, Percent } from 'lucide-react';

export const OverviewCards = ({ overview }) => {
  const cards = [
    {
      title: 'Total Study Time',
      value: `${overview.totalStudyHours} hrs`,
      subtext: `${overview.totalStudyMinutes} mins logged`,
      icon: Clock,
      color: 'from-blue-500/15 to-indigo-500/15 text-blue-500 border-blue-500/20',
      glow: 'shadow-glow',
    },
    {
      title: 'Tasks Completed',
      value: overview.completedTasks,
      subtext: `Out of ${overview.totalTasks} total tasks`,
      icon: CheckCircle2,
      color: 'from-emerald-500/15 to-teal-500/15 text-emerald-500 border-emerald-500/20',
      glow: 'shadow-glow-emerald',
    },
    {
      title: 'Completion Rate',
      value: `${overview.completionRate}%`,
      subtext: overview.overdueTasks > 0 ? `${overview.overdueTasks} tasks overdue` : 'No overdue tasks!',
      icon: Percent,
      color: 'from-purple-500/15 to-pink-500/15 text-purple-500 border-purple-500/20',
      glow: 'shadow-glow-purple',
    },
    {
      title: 'Current Streak',
      value: `${overview.currentStreak} Days`,
      subtext: `Best: ${overview.longestStreak} days active`,
      icon: Flame,
      color: 'from-amber-500/15 to-orange-500/15 text-amber-500 border-amber-500/20',
      glow: 'shadow-glow-amber',
    },
    {
      title: 'Focus Sessions',
      value: overview.pomodoroSessions,
      subtext: 'Completed Pomodoros',
      icon: Timer,
      color: 'from-indigo-500/15 to-violet-500/15 text-indigo-500 border-indigo-500/20',
      glow: 'shadow-glow',
    },
    {
      title: 'Upcoming Exams',
      value: overview.upcomingExamsCount,
      subtext: overview.daysUntilNextExam !== null ? `Next exam in ${overview.daysUntilNextExam} days` : 'No exams scheduled',
      icon: GraduationCap,
      color: 'from-rose-500/15 to-red-500/15 text-rose-500 border-rose-500/20',
      glow: 'shadow-glow-rose',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`glass-card-hover p-4 rounded-3xl border bg-gradient-to-br ${c.color} flex flex-col justify-between transition-all duration-300 hover:scale-[1.03] group`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                {c.title}
              </span>
              <div className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/60 group-hover:scale-110 transition-transform">
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {c.value}
              </div>
              <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
                {c.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
