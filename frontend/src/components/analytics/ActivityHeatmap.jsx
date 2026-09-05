import React, { useState } from 'react';
import { Calendar, Info } from 'lucide-react';

export const ActivityHeatmap = ({ heatmapData }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  if (!heatmapData || heatmapData.length === 0) return null;

  const getIntensityClass = (intensity) => {
    switch (intensity) {
      case 4:
        return 'bg-indigo-600 border-indigo-500 shadow-sm shadow-indigo-500/50';
      case 3:
        return 'bg-indigo-500/80 border-indigo-400';
      case 2:
        return 'bg-indigo-500/50 border-indigo-400/50';
      case 1:
        return 'bg-indigo-500/25 border-indigo-500/30';
      default:
        return 'bg-slate-200/50 dark:bg-slate-800/50 border-slate-300/30 dark:border-slate-800';
    }
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-4 relative">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              12-Week Daily Activity Heatmap
            </h3>
            <p className="text-[11px] text-slate-500">Study & task activity intensity over the past 84 days</p>
          </div>
        </div>

        {/* Legend Indicator */}
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded bg-slate-800" />
          <div className="w-2.5 h-2.5 rounded bg-indigo-500/25" />
          <div className="w-2.5 h-2.5 rounded bg-indigo-500/50" />
          <div className="w-2.5 h-2.5 rounded bg-indigo-500/80" />
          <div className="w-2.5 h-2.5 rounded bg-indigo-600" />
          <span>More</span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-[650px] p-2">
          {heatmapData.map((day) => (
            <div
              key={day.date}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-md border transition-all duration-200 cursor-pointer hover:scale-125 ${getIntensityClass(
                day.intensity
              )}`}
            />
          ))}
        </div>
      </div>

      {/* Hover Info Tooltip Banner */}
      <div className="h-6 flex items-center justify-between text-xs font-bold px-2 text-slate-400">
        {hoveredDay ? (
          <div className="flex items-center gap-3 text-indigo-400 animate-fadeIn">
            <span>📅 {hoveredDay.formattedDate}</span>
            <span>⏱️ {hoveredDay.focusMinutes} Mins Focus</span>
            <span>✅ {hoveredDay.completedTasks} Tasks Completed</span>
            <span>🍅 {hoveredDay.pomodoroCount} Sessions</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500 font-medium">Hover over any day square to inspect detailed daily focus time and task counts.</span>
        )}
      </div>
    </div>
  );
};
