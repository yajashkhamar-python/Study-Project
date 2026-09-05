import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const ExamForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [subject, setSubject] = useState(initialData.subject || '');
  const [examDate, setExamDate] = useState(
    initialData.examDate ? new Date(initialData.examDate).toISOString().split('T')[0] : ''
  );
  const [examTime, setExamTime] = useState(initialData.examTime || '09:00 AM');
  const [venue, setVenue] = useState(initialData.venue || '');
  const [syllabusNotes, setSyllabusNotes] = useState(initialData.syllabusNotes || '');
  const [colorTag, setColorTag] = useState(initialData.colorTag || '#6366f1');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      subject,
      examDate,
      examTime,
      venue,
      syllabusNotes,
      colorTag,
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Subject Name"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="e.g. Computer Science"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Exam Date"
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          required
        />
        <Input
          label="Exam Time"
          value={examTime}
          onChange={(e) => setExamTime(e.target.value)}
          placeholder="09:00 AM"
        />
      </div>

      <Input
        label="Venue / Location"
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        placeholder="e.g. Room 402, Hall A"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Syllabus & Notes
        </label>
        <textarea
          rows={3}
          value={syllabusNotes}
          onChange={(e) => setSyllabusNotes(e.target.value)}
          placeholder="Key topics to review, references, formula sheet..."
          className="w-full bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Color Tag
        </label>
        <div className="flex gap-3 items-center">
          {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColorTag(c)}
              className={`w-7 h-7 rounded-full border-2 transition ${
                colorTag === c ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData._id ? 'Update Exam' : 'Schedule Exam'}
        </Button>
      </div>
    </form>
  );
};
