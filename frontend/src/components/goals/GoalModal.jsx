import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Target, Calendar, Tag, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';

export const GoalModal = ({ isOpen, onClose, onSubmit, initialGoal = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Academic');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('Not Started');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState('');
  const [milestones, setMilestones] = useState(['']);
  const [error, setError] = useState('');

  const categories = ['Academic', 'Programming', 'Career', 'Personal', 'Projects', 'Other'];
  const priorities = ['high', 'medium', 'low'];
  const statuses = ['Not Started', 'In Progress', 'Completed', 'Paused', 'Overdue'];

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title || '');
      setDescription(initialGoal.description || '');
      setCategory(initialGoal.category || 'Academic');
      setPriority(initialGoal.priority || 'medium');
      setStatus(initialGoal.status || 'Not Started');
      setStartDate(
        initialGoal.startDate
          ? new Date(initialGoal.startDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setTargetDate(
        initialGoal.targetDate
          ? new Date(initialGoal.targetDate).toISOString().split('T')[0]
          : ''
      );
      setMilestones(
        initialGoal.milestones && initialGoal.milestones.length > 0
          ? initialGoal.milestones.map((m) => (typeof m === 'string' ? m : m.title))
          : ['']
      );
    } else {
      setTitle('');
      setDescription('');
      setCategory('Academic');
      setPriority('medium');
      setStatus('Not Started');
      setStartDate(new Date().toISOString().split('T')[0]);
      // Default target date 30 days from now
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setTargetDate(d.toISOString().split('T')[0]);
      setMilestones(['', '']);
    }
    setError('');
  }, [initialGoal, isOpen]);

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    setMilestones([...milestones, '']);
  };

  const handleRemoveMilestone = (index) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index, value) => {
    const updated = [...milestones];
    updated[index] = value;
    setMilestones(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a goal title.');
      return;
    }
    if (!targetDate) {
      setError('Please select a target deadline date.');
      return;
    }

    const cleanMilestones = milestones
      .filter((m) => m.trim().length > 0)
      .map((m) => ({ title: m.trim() }));

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status,
      startDate,
      targetDate,
      milestones: cleanMilestones,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {initialGoal ? 'Edit Goal' : 'Create New Goal'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Goal Title */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Data Structures & Algorithms"
              className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Goal Description */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you want to accomplish..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p.toUpperCase()} Priority
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">
                Target Deadline *
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Milestones Editor Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold uppercase text-slate-400">
                Goal Milestones & Checkpoints
              </label>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-400"
              >
                <Plus className="w-3.5 h-3.5" /> Add Milestone
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={m}
                    onChange={(e) => handleMilestoneChange(idx, e.target.value)}
                    placeholder={`Milestone ${idx + 1} (e.g. Arrays & Strings)`}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove milestone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" size="md">
              {initialGoal ? 'Update Goal' : 'Save Goal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
