import React from 'react';
import { Filter } from 'lucide-react';

export const CalendarFilterBar = ({ activeFilters, onToggleFilter }) => {
  const filters = [
    { id: 'exam', label: 'Exams', color: 'bg-rose-500', text: 'text-rose-400 border-rose-500/30' },
    { id: 'task', label: 'Tasks', color: 'bg-amber-500', text: 'text-amber-400 border-amber-500/30' },
    { id: 'milestone', label: 'Goals & Milestones', color: 'bg-purple-500', text: 'text-purple-400 border-purple-500/30' },
    { id: 'focus', label: 'Focus Sessions', color: 'bg-emerald-500', text: 'text-emerald-400 border-emerald-500/30' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1 mr-1">
        <Filter className="w-3.5 h-3.5" /> Filters:
      </span>

      {filters.map((f) => {
        const isActive = activeFilters.includes(f.id);
        return (
          <button
            key={f.id}
            onClick={() => onToggleFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 border ${
              isActive
                ? `${f.text} bg-slate-900/60 shadow-sm scale-105`
                : 'text-slate-500 border-slate-700/50 bg-slate-900/20 opacity-50 hover:opacity-100'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${f.color}`} />
            <span>{f.label}</span>
          </button>
        );
      })}
    </div>
  );
};
