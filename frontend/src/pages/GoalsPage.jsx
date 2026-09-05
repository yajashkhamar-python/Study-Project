import React, { useState, useEffect } from 'react';
import { Target, Plus, Search, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { goalService } from '../services/goalService';
import { Loader } from '../components/common/Loader';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalModal } from '../components/goals/GoalModal';
import { GoalDetailModal } from '../components/goals/GoalDetailModal';
import { GoalFilters } from '../components/goals/GoalFilters';
import { useToast } from '../context/ToastContext';

export const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const { addToast } = useToast();

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await goalService.getGoals({
        search,
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        sortBy,
      });

      if (res.success && Array.isArray(res.data)) {
        setGoals(res.data);
      } else {
        setError('Unable to load goals.');
      }
    } catch (err) {
      console.error('Fetch goals error:', err);
      setError(err.response?.data?.message || 'Failed to fetch goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [search, statusFilter, categoryFilter, priorityFilter, sortBy]);

  const handleCreateOrUpdateGoal = async (data) => {
    try {
      if (editingGoal) {
        const res = await goalService.updateGoal(editingGoal._id, data);
        if (res.success) {
          addToast('Goal updated successfully!', 'success');
          setIsCreateModalOpen(false);
          setEditingGoal(null);
          fetchGoals();
          if (selectedGoal && selectedGoal._id === editingGoal._id) {
            setSelectedGoal(res.data);
          }
        }
      } else {
        const res = await goalService.createGoal(data);
        if (res.success) {
          addToast('New goal created!', 'success');
          setIsCreateModalOpen(false);
          fetchGoals();
        }
      }
    } catch (err) {
      console.error('Save goal error:', err);
      addToast('Failed to save goal', 'error');
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      const res = await goalService.deleteGoal(id);
      if (res.success) {
        addToast('Goal deleted', 'info');
        setSelectedGoal(null);
        fetchGoals();
      }
    } catch (err) {
      console.error('Delete goal error:', err);
      addToast('Failed to delete goal', 'error');
    }
  };

  const handleGoalUpdated = (updatedGoal) => {
    setGoals((prev) => prev.map((g) => (g._id === updatedGoal._id ? updatedGoal : g)));
    if (selectedGoal && selectedGoal._id === updatedGoal._id) {
      setSelectedGoal(updatedGoal);
    }
  };

  // Aggregated Stats
  const totalGoals = goals.length;
  const activeGoalsCount = goals.filter((g) => g.status === 'In Progress' || g.status === 'Not Started').length;
  const completedGoalsCount = goals.filter((g) => g.status === 'Completed').length;
  const overdueGoalsCount = goals.filter((g) => g.status === 'Overdue').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Target className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Goals & Milestones
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Set goals, break them into milestones, and track your progress.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Goal</span>
        </button>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Goals</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{totalGoals}</div>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-indigo-500/20 bg-indigo-500/5">
          <span className="text-[10px] font-extrabold uppercase text-indigo-400">Active Goals</span>
          <div className="text-xl font-black text-indigo-500 mt-1">{activeGoalsCount}</div>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-emerald-500/20 bg-emerald-500/5">
          <span className="text-[10px] font-extrabold uppercase text-emerald-400">Completed</span>
          <div className="text-xl font-black text-emerald-500 mt-1">{completedGoalsCount}</div>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-rose-500/20 bg-rose-500/5">
          <span className="text-[10px] font-extrabold uppercase text-rose-400">Overdue</span>
          <div className="text-xl font-black text-rose-500 mt-1">{overdueGoalsCount}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <GoalFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {/* Loading & Error Handling */}
      {loading ? (
        <Loader fullScreen={false} />
      ) : error ? (
        <div className="glass-card p-8 rounded-3xl border border-rose-500/30 text-center max-w-md mx-auto my-8 space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <p className="text-xs text-slate-400 font-bold">{error}</p>
          <button
            onClick={fetchGoals}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            Retry
          </button>
        </div>
      ) : goals.length === 0 ? (
        /* Empty State */
        <div className="glass-card p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-center max-w-md mx-auto my-8 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <Target className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">No goals found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Create your first goal and break it into achievable milestones.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingGoal(null);
              setIsCreateModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25"
          >
            + Create Goal
          </button>
        </div>
      ) : (
        /* Goals Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onViewDetails={(g) => setSelectedGoal(g)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      <GoalModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingGoal(null);
        }}
        onSubmit={handleCreateOrUpdateGoal}
        initialGoal={editingGoal}
      />

      {/* Goal Detail View Modal */}
      <GoalDetailModal
        goal={selectedGoal}
        isOpen={Boolean(selectedGoal)}
        onClose={() => setSelectedGoal(null)}
        onGoalUpdated={handleGoalUpdated}
        onEditGoal={(g) => {
          setSelectedGoal(null);
          setEditingGoal(g);
          setIsCreateModalOpen(true);
        }}
        onDeleteGoal={handleDeleteGoal}
      />
    </div>
  );
};

export default GoalsPage;
