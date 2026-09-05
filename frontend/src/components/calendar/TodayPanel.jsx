import React from 'react';
import { Calendar as CalendarIcon, CheckSquare, Square, Timer, GraduationCap, Clock, Award } from 'lucide-react';
import { taskService } from '../../services/taskService';
import { useToast } from '../../context/ToastContext';

export const TodayPanel = ({ todayData, nextExam, onTaskStatusChanged }) => {
  const { addToast } = useToast();

  const formattedDate = new Date().toLocaleDateString([], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const { tasks = [], completedCount = 0, totalTasks = 0, progress = 0, focusMinutes = 0 } = todayData || {};

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const res = await taskService.updateTaskStatus(taskId, newStatus);
      if (res.success) {
        onTaskStatusChanged();
        addToast(`Task marked as ${newStatus}`, 'info');
      }
    } catch (err) {
      console.error('Task toggle error:', err);
      addToast('Failed to update task', 'error');
    }
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-6 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Date Header */}
        <div className="pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
            TODAY'S SCHEDULE
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {formattedDate}
          </h3>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300">Daily Task Completion</span>
            <span className="font-mono text-indigo-400 font-black">{progress}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-medium block pt-0.5">
            {completedCount} of {totalTasks} tasks completed today
          </span>
        </div>

        {/* Today's Tasks Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase text-slate-400">
            <span>Today's Tasks</span>
            <span className="text-[10px]">{tasks.length} tasks</span>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-400 font-medium bg-slate-900/40 rounded-2xl border border-slate-800">
              No tasks scheduled for today! 🎉
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {tasks.map((t) => {
                const isDone = t.status === 'completed';
                return (
                  <div
                    key={t._id}
                    onClick={() => handleToggleTask(t._id, t.status)}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-400 line-through'
                        : 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800 text-slate-900 dark:text-white hover:border-indigo-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden mr-2">
                      {isDone ? (
                        <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <span className="text-xs font-bold truncate">{t.title}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-400 flex-shrink-0">
                      {t.subject || 'General'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Focus Hours Summary */}
        <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Timer className="w-5 h-5 text-emerald-500" />
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Focus Hours Today</span>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {Math.floor(focusMinutes / 60)}h {focusMinutes % 60}m logged
              </div>
            </div>
          </div>
        </div>

        {/* Next Exam Countdown Card */}
        {nextExam && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/15 via-red-500/10 to-slate-900/60 border border-rose-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Next Exam Countdown
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black">
                {nextExam.daysRemaining} DAYS
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {nextExam.subject} Exam
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">
                  {new Date(nextExam.examDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {nextExam.examTime || 'Morning'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
