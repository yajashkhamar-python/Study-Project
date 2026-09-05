import React from 'react';
import { X, Calendar as CalendarIcon, Clock, CheckSquare, GraduationCap, Target, Timer, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CalendarEventModal = ({ event, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen || !event) return null;

  const { title, type, start, end, subject, status, priority, originalData } = event;

  const formattedDate = start
    ? new Date(start).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';

  const formattedTime = start
    ? new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const getBadgeStyle = (t) => {
    switch (t) {
      case 'exam':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'task':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'milestone':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  const handleActionClick = () => {
    onClose();
    if (type === 'task') navigate('/tasks');
    else if (type === 'exam') navigate('/exams');
    else if (type === 'milestone') navigate('/goals');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-md rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getBadgeStyle(type)}`}>
            {type === 'milestone' ? 'Goal Milestone' : type.toUpperCase()}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {title.replace(/^[\u2600-\u27BF\u1F300-\u1F6FF\u1F900-\u1F9FF]\s*/, '')}
            </h3>
            <span className="text-xs text-slate-400 font-bold block mt-1">
              Subject: <strong className="text-indigo-400">{subject || 'General'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" /> Scheduled Date
              </span>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                {formattedDate}
              </div>
            </div>

            {formattedTime && (
              <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Time
                </span>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {formattedTime}
                </div>
              </div>
            )}
          </div>

          {/* Details extra info */}
          {originalData && (
            <div className="space-y-2 text-xs font-medium text-slate-400 bg-slate-100/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/60">
              {originalData.description && (
                <div>
                  <strong className="text-slate-200 block mb-0.5">Description:</strong>
                  <span>{originalData.description}</span>
                </div>
              )}
              {originalData.priority && (
                <div>
                  <strong className="text-slate-200">Priority:</strong> {originalData.priority.toUpperCase()}
                </div>
              )}
              {originalData.venue && (
                <div>
                  <strong className="text-slate-200">Venue:</strong> {originalData.venue}
                </div>
              )}
              {originalData.goalTitle && (
                <div>
                  <strong className="text-slate-200">Goal:</strong> {originalData.goalTitle}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between bg-slate-900/20">
          <button
            onClick={handleActionClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
          >
            <span>View {type === 'milestone' ? 'Goal' : type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
