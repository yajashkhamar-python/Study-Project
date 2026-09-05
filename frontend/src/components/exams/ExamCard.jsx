import React from 'react';
import { Calendar, Clock, MapPin, BookOpen, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

export const ExamCard = ({ exam, onEdit, onDelete }) => {
  const calculateDaysLeft = (targetDate) => {
    const diffTime = new Date(targetDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = calculateDaysLeft(exam.examDate);

  return (
    <div
      className="glass-card-hover p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 transition-all duration-300 relative overflow-hidden group"
      style={{ borderLeft: `6px solid ${exam.colorTag || '#6366f1'}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
            {exam.subject}
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-2">
            {exam.title || `${exam.subject} Examination`}
          </h3>
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(exam)}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
              title="Edit exam"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(exam._id)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Delete exam"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-700/40">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{new Date(exam.examDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{exam.examTime}</span>
        </div>
        <div className="flex items-center gap-2 col-span-2">
          <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="truncate">{exam.venue}</span>
        </div>
      </div>

      {exam.syllabusNotes && (
        <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/60 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
          <BookOpen className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="line-clamp-2 leading-relaxed">{exam.syllabusNotes}</p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <Badge
          variant={
            daysLeft < 0 ? 'overdue' : daysLeft <= 3 ? 'urgent' : daysLeft <= 7 ? 'medium' : 'default'
          }
        >
          {daysLeft < 0
            ? 'Exam Passed'
            : daysLeft === 0
            ? 'Today!'
            : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
        </Badge>

        {exam.linkedTasks && exam.linkedTasks.length > 0 && (
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/60 px-2.5 py-0.5 rounded-full">
            {exam.linkedTasks.length} linked tasks
          </span>
        )}
      </div>
    </div>
  );
};

