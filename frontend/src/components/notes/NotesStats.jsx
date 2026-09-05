import React from 'react';
import { BookOpen, Pin, Star, Award } from 'lucide-react';

export const NotesStats = ({ notes = [] }) => {
  const totalNotes = notes.length;
  const pinnedCount = notes.filter((n) => n.isPinned).length;
  const importantCount = notes.filter((n) => n.isImportant).length;

  // Calculate top subject
  const subjectCounts = {};
  notes.forEach((n) => {
    const subj = n.subject || 'General';
    subjectCounts[subj] = (subjectCounts[subj] || 0) + 1;
  });

  let topSubject = 'General';
  let maxCount = 0;
  Object.entries(subjectCounts).forEach(([subj, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topSubject = subj;
    }
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Total Notes */}
      <div className="glass-card-hover p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 group">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300 shadow-glow">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            Total Notes
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
            {totalNotes}
          </div>
        </div>
      </div>

      {/* Pinned Notes */}
      <div className="glass-card-hover p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 group">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300 shadow-glow-purple">
          <Pin className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            Pinned Notes
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
            {pinnedCount}
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="glass-card-hover p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 group">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300 shadow-glow-amber">
          <Star className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            Important
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
            {importantCount}
          </div>
        </div>
      </div>

      {/* Top Subject */}
      <div className="glass-card-hover p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 group">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300 shadow-glow-emerald">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            Top Subject
          </span>
          <div className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[120px] mt-1">
            {topSubject}
          </div>
        </div>
      </div>
    </div>
  );
};
