import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const TaskForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [subject, setSubject] = useState(initialData.subject || 'Mathematics');
  const [dueDate, setDueDate] = useState(
    initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : ''
  );
  const [priority, setPriority] = useState(initialData.priority || 'medium');
  const [status, setStatus] = useState(initialData.status || 'pending');
  const [isRecurring, setIsRecurring] = useState(initialData.isRecurring || false);
  const [recurringInterval, setRecurringInterval] = useState(initialData.recurringInterval || 'none');
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialData.estimatedMinutes || 60);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      title,
      description,
      subject,
      dueDate,
      priority,
      status,
      isRecurring,
      recurringInterval,
      estimatedMinutes: Number(estimatedMinutes),
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Complete Calculus Homework Ch. 4"
        required
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add detailed task instructions..."
          className="w-full bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          required
        />
        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <Input
          label="Est. Mins"
          type="number"
          value={estimatedMinutes}
          onChange={(e) => setEstimatedMinutes(e.target.value)}
        />
      </div>

      <div className="pt-2 flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
          />
          <span>Recurring Task?</span>
        </label>

        {isRecurring && (
          <select
            value={recurringInterval}
            onChange={(e) => setRecurringInterval(e.target.value)}
            className="bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData._id ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};
