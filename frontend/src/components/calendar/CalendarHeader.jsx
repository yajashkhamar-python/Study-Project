import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Search, CheckSquare, GraduationCap, Target } from 'lucide-react';

export const CalendarHeader = ({
  currentDate,
  view,
  onViewChange,
  onNavigate,
  onQuickAdd,
  search,
  onSearchChange,
}) => {
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);

  const views = [
    { id: 'month', label: 'Month' },
    { id: 'week', label: 'Week' },
    { id: 'day', label: 'Day' },
    { id: 'agenda', label: 'Agenda' },
  ];

  const safeDate =
    currentDate && currentDate instanceof Date && !isNaN(currentDate.valueOf())
      ? currentDate
      : new Date();

  const formattedMonthYear = safeDate.toLocaleDateString([], {
    month: 'long',
    year: 'numeric',
  });


  return (
    <div className="glass-card p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {formattedMonthYear}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Study Planning & Academic Schedule
              </p>
            </div>
          </div>

          {/* Nav Prev / Today / Next Buttons */}
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-300/50 dark:border-slate-800">
            <button
              onClick={() => onNavigate('PREV')}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-800"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('TODAY')}
              className="px-3 py-1 rounded-xl text-xs font-black text-slate-800 dark:text-slate-200 hover:bg-slate-300/50 dark:hover:bg-slate-800"
            >
              Today
            </button>
            <button
              onClick={() => onNavigate('NEXT')}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-800"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher & Quick Add Button */}
        <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
          {/* View Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-900/80 border border-slate-300/50 dark:border-slate-800">
            {views.map((v) => (
              <button
                key={v.id}
                onClick={() => onViewChange(v.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                  view === v.id
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-300/50 dark:hover:bg-slate-800/50'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Quick Add Button & Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowQuickAddMenu(!showQuickAddMenu)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>

            {showQuickAddMenu && (
              <div
                className="absolute right-0 mt-2 w-48 glass-card rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-30 animate-fadeIn"
                onClick={() => setShowQuickAddMenu(false)}
              >
                <button
                  onClick={() => onQuickAdd('task')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-400"
                >
                  <CheckSquare className="w-4 h-4 text-amber-500" />
                  <span>Add Task</span>
                </button>
                <button
                  onClick={() => onQuickAdd('exam')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-400"
                >
                  <GraduationCap className="w-4 h-4 text-rose-500" />
                  <span>Add Exam</span>
                </button>
                <button
                  onClick={() => onQuickAdd('goal')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-400"
                >
                  <Target className="w-4 h-4 text-purple-500" />
                  <span>Add Goal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Search Bar */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter calendar events by subject or keyword..."
          className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>
  );
};
