import React from 'react';
import { Calendar as CalendarIcon, Clock, CheckSquare, GraduationCap, Target, Timer, ChevronRight } from 'lucide-react';

const formatDateKey = (d) => {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const CustomCalendarGrid = ({
  currentDate,
  view,
  events = [],
  onSelectEvent,
  onDateClick,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper: Month Grid Generation
  const getMonthGridDays = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Mon = 0, Sun = 6

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const days = [];

    // Previous month padding days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true });
    }

    // Next month padding days to complete 35 or 42 grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  };

  // Helper: Week Days Generation (Mon - Sun)
  const getWeekDays = () => {
    const current = new Date(currentDate);
    const dayOfWeek = (current.getDay() + 6) % 7;
    const monday = new Date(current);
    monday.setDate(current.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const isToday = (d) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const getEventsForDate = (date) => {
    const key = formatDateKey(date);
    return events.filter((e) => formatDateKey(e.start) === key);
  };

  // --- MONTH VIEW ---
  if (view === 'month') {
    const monthDays = getMonthGridDays();
    const weekHeadings = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="flex flex-col h-full space-y-2">
        {/* Week Headings */}
        <div className="grid grid-cols-7 gap-1 text-center py-2 border-b border-slate-200/50 dark:border-slate-800/80">
          {weekHeadings.map((h) => (
            <span key={h} className="text-xs font-black uppercase text-slate-400">
              {h}
            </span>
          ))}
        </div>

        {/* Month Grid Cells */}
        <div className="grid grid-cols-7 grid-rows-6 gap-1.5 flex-1 min-h-0">
          {monthDays.map((item, idx) => {
            const dayEvents = getEventsForDate(item.date);
            const today = isToday(item.date);

            return (
              <div
                key={idx}
                onClick={() => onDateClick && onDateClick(item.date)}
                className={`p-1.5 rounded-2xl border flex flex-col justify-between transition-all duration-200 cursor-pointer overflow-hidden ${
                  today
                    ? 'bg-indigo-500/10 border-indigo-500/40 shadow-sm'
                    : item.isCurrentMonth
                    ? 'bg-slate-100/50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/60 hover:border-slate-400 dark:hover:border-slate-700'
                    : 'bg-slate-200/20 dark:bg-slate-900/20 border-transparent opacity-40'
                }`}
              >
                {/* Date Number Badge */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${
                      today
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.date.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded-full">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Day Event Pills List */}
                <div className="space-y-1 overflow-y-auto flex-1 max-h-16 pr-0.5">
                  {dayEvents.slice(0, 3).map((evt) => (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-white truncate shadow-sm cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: evt.color || '#6366f1' }}
                    >
                      {evt.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[9px] font-bold text-slate-400 block text-right">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- WEEK VIEW ---
  if (view === 'week') {
    const weekDays = getWeekDays();

    return (
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 h-full overflow-y-auto">
        {weekDays.map((d, idx) => {
          const dayEvents = getEventsForDate(d);
          const today = isToday(d);

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                today
                  ? 'bg-indigo-500/10 border-indigo-500/40 shadow-md'
                  : 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800">
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-slate-400">
                    {d.toLocaleDateString([], { weekday: 'short' })}
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {d.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                {today && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                    Today
                  </span>
                )}
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto">
                {dayEvents.length === 0 ? (
                  <span className="text-[11px] text-slate-400 font-medium italic block pt-2">
                    No events
                  </span>
                ) : (
                  dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      className="p-2.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer hover:scale-105 transition-transform space-y-1"
                      style={{ backgroundColor: evt.color || '#6366f1' }}
                    >
                      <div className="truncate">{evt.title}</div>
                      <div className="text-[9px] opacity-80 uppercase">{evt.type}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // --- DAY VIEW ---
  if (view === 'day') {
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div className="p-6 rounded-3xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 h-full flex flex-col justify-between space-y-4">
        <div className="pb-3 border-b border-slate-200/50 dark:border-slate-800">
          <span className="text-xs font-extrabold uppercase text-indigo-400">
            DAY VIEW AGENDAS
          </span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {currentDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {dayEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium text-xs">
              No academic events or tasks scheduled for this date.
            </div>
          ) : (
            dayEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-200/40 dark:bg-slate-900/80 hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-10 rounded-full"
                    style={{ backgroundColor: evt.color || '#6366f1' }}
                  />
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                      {evt.title}
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">
                      Subject: {evt.subject || 'General'} • Priority: {evt.priority || 'Normal'}
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase text-white" style={{ backgroundColor: evt.color }}>
                  {evt.type}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // --- AGENDA VIEW ---
  const sortedEvents = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));

  return (
    <div className="p-6 rounded-3xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 h-full flex flex-col justify-between space-y-4">
      <div className="pb-3 border-b border-slate-200/50 dark:border-slate-800">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          Full Academic Agenda
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          All scheduled exams, tasks, goal milestones, and focus sessions in chronological order.
        </p>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium text-xs">
            No items in your agenda yet.
          </div>
        ) : (
          sortedEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => onSelectEvent(evt)}
              className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-200/40 dark:bg-slate-900/80 hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-10 rounded-full"
                  style={{ backgroundColor: evt.color || '#6366f1' }}
                />
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                    {evt.title}
                  </h4>
                  <span className="text-xs text-slate-400 font-medium">
                    📅 {new Date(evt.start).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • {evt.subject || 'General'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase text-white" style={{ backgroundColor: evt.color }}>
                  {evt.type}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
