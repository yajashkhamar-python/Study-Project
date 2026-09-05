import React from 'react';
import { Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react';

export const UpcomingEventsList = ({ events = [], onSelectEvent }) => {
  const upcomingEvents = events
    .filter((e) => new Date(e.start) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 5);

  if (upcomingEvents.length === 0) {
    return (
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md text-center py-6">
        <Clock className="w-8 h-8 text-slate-400 opacity-50 mx-auto mb-1" />
        <p className="text-xs text-slate-500 font-medium">No upcoming events scheduled.</p>
      </div>
    );
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case 'exam':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'task':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'milestone':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-indigo-400" /> Upcoming Academic Agenda
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {upcomingEvents.map((evt) => {
          const daysRemaining = Math.max(
            0,
            Math.ceil((new Date(evt.start) - new Date()) / (1000 * 60 * 60 * 24))
          );

          return (
            <div
              key={evt.id}
              onClick={() => onSelectEvent(evt)}
              className="p-3.5 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition-all flex flex-col justify-between space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getTypeBadge(evt.type)}`}>
                  {evt.type}
                </span>
                <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  {daysRemaining === 0 ? 'Today' : `${daysRemaining} days`}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-indigo-400 transition-colors">
                  {evt.title}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {new Date(evt.start).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
