import React from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, Trash2, Edit3, Repeat } from 'lucide-react';
import { Badge } from '../common/Badge';

export const TaskCard = ({ task, onStatusChange, onEdit, onDelete }) => {
  const isOverdue = task.status === 'overdue' || (task.status !== 'completed' && new Date(task.dueDate) < new Date());

  return (
    <div
      className={`glass-card-hover p-4 sm:p-5 rounded-2xl border flex flex-col justify-between group transition-all duration-300 relative ${
        task.status === 'completed'
          ? 'opacity-70 border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20'
          : isOverdue
          ? 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/20 shadow-glow-rose'
          : 'border-slate-200/80 dark:border-slate-800'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={task.status === 'completed'}
              onChange={(e) =>
                onStatusChange(task._id, e.target.checked ? 'completed' : 'pending')
              }
              className="w-4.5 h-4.5 rounded-md border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500/40 cursor-pointer accent-indigo-600 transition"
            />
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {task.subject}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
                title="Edit task"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(task._id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <h4
          className={`font-bold text-sm text-slate-900 dark:text-slate-100 ${
            task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''
          }`}
        >
          {task.title}
        </h4>

        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Badge variant={isOverdue ? 'overdue' : task.priority}>{task.priority}</Badge>
          {task.isRecurring && (
            <span
              className="flex items-center gap-1 text-[10px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-md"
              title={`Repeats ${task.recurringInterval}`}
            >
              <Repeat className="w-3 h-3" /> {task.recurringInterval}
            </span>
          )}
        </div>

        <div
          className={`flex items-center gap-1.5 font-semibold ${
            isOverdue ? 'text-rose-500 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

