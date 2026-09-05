import React, { useState } from 'react';
import {
  X,
  Target,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit,
  Calendar,
  Award,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { goalService } from '../../services/goalService';
import { useToast } from '../../context/ToastContext';

export const GoalDetailModal = ({
  goal,
  isOpen,
  onClose,
  onGoalUpdated,
  onEditGoal,
  onDeleteGoal,
}) => {
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { addToast } = useToast();

  if (!isOpen || !goal) return null;

  const {
    _id,
    title,
    description,
    category,
    priority,
    status,
    targetDate,
    startDate,
    progress = 0,
    milestones = [],
    linkedTasks = [],
  } = goal;

  const handleToggleMilestone = async (milestoneId) => {
    try {
      setLoading(true);
      const res = await goalService.toggleMilestone(_id, milestoneId);
      if (res.success && res.data) {
        onGoalUpdated(res.data);
        if (res.data.progress === 100) {
          addToast(`🎉 Goal Completed! Congratulations on achieving "${title}"!`, 'success');
        } else {
          addToast('Milestone status updated', 'info');
        }
      }
    } catch (err) {
      console.error('Toggle milestone error:', err);
      addToast('Failed to update milestone', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    try {
      setLoading(true);
      const res = await goalService.addMilestone(_id, { title: newMilestoneTitle.trim() });
      if (res.success && res.data) {
        setNewMilestoneTitle('');
        onGoalUpdated(res.data);
        addToast('Milestone added', 'success');
      }
    } catch (err) {
      console.error('Add milestone error:', err);
      addToast('Failed to add milestone', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    try {
      setLoading(true);
      const res = await goalService.deleteMilestone(_id, milestoneId);
      if (res.success && res.data) {
        onGoalUpdated(res.data);
        addToast('Milestone deleted', 'info');
      }
    } catch (err) {
      console.error('Delete milestone error:', err);
      addToast('Failed to delete milestone', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formattedTargetDate = targetDate
    ? new Date(targetDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No Date';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {category} • {priority.toUpperCase()} PRIORITY
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white truncate max-w-md">
                {title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditGoal(goal)}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
              title="Edit Goal"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Goal Completed Celebration Banner */}
          {progress === 100 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-3 animate-bounce">
              <Sparkles className="w-6 h-6 flex-shrink-0" />
              <div>
                <div className="font-extrabold text-sm text-white">🎉 Goal Completed!</div>
                <div className="text-xs text-emerald-300">
                  Congratulations! All checkpoints achieved.
                </div>
              </div>
            </div>
          )}

          {/* Goal Details Header Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Status</span>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                {status}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Progress</span>
              <div className="text-sm font-black text-indigo-400 font-mono mt-0.5">
                {progress}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Target Date</span>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                {formattedTargetDate}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Overall Completion</span>
              <span>
                {milestones.filter((m) => m.completed).length} / {milestones.length} Milestones
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {description && (
            <div>
              <h4 className="text-xs font-extrabold uppercase text-slate-400 mb-1">Description</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-slate-100/60 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/60">
                {description}
              </p>
            </div>
          )}

          {/* Milestones Checklist Section */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              <span>Milestones & Checkpoints</span>
            </h4>

            {milestones.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-medium bg-slate-900/40 rounded-2xl border border-slate-800">
                No milestones added yet. Add your first milestone below!
              </div>
            ) : (
              <div className="space-y-2">
                {milestones.map((m) => (
                  <div
                    key={m._id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      m.completed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-400 line-through'
                        : 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800 text-slate-900 dark:text-white'
                    }`}
                  >
                    <div
                      onClick={() => handleToggleMilestone(m._id)}
                      className="flex items-center gap-3 cursor-pointer flex-1 mr-2"
                    >
                      {m.completed ? (
                        <CheckSquare className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 flex-shrink-0 hover:text-indigo-400" />
                      )}
                      <span className="text-xs font-bold">{m.title}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteMilestone(m._id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      title="Delete milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Add Milestone Form */}
            <form onSubmit={handleAddMilestone} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="Add a new milestone..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>
          </div>

          {/* Linked Tasks Section (If any) */}
          {linkedTasks.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-extrabold uppercase text-slate-400">Associated Tasks</h4>
              <div className="space-y-1.5">
                {linkedTasks.map((t) => (
                  <div key={t._id} className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs font-bold flex items-center justify-between text-slate-300">
                    <span>{t.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-400">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between bg-slate-900/20">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-500">Delete this goal?</span>
              <button
                onClick={() => onDeleteGoal(_id)}
                className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 text-slate-400 text-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete Goal
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
