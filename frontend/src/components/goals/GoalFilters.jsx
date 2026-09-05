import React from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';

export const GoalFilters = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortByChange,
}) => {
  const statusTabs = [
    { id: 'all', label: 'All Goals' },
    { id: 'In Progress', label: 'Active' },
    { id: 'Completed', label: 'Completed' },
    { id: 'Overdue', label: 'Overdue' },
    { id: 'Paused', label: 'Paused' },
  ];

  const categories = ['all', 'Academic', 'Programming', 'Career', 'Personal', 'Projects', 'Other'];
  const priorities = ['all', 'high', 'medium', 'low'];
  const sortOptions = [
    { id: 'deadline', label: 'Nearest Deadline' },
    { id: 'priority', label: 'Highest Priority' },
    { id: 'progress', label: 'Highest Progress' },
    { id: 'recent', label: 'Recently Created' },
  ];

  return (
    <div className="glass-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-4">
      {/* Top Search Bar & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search goals or milestones..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Dropdowns Group */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.filter((c) => c !== 'all').map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold focus:outline-none"
          >
            <option value="all">All Priorities</option>
            {priorities.filter((p) => p !== 'all').map((p) => (
              <option key={p} value={p}>{p.toUpperCase()} Priority</option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold focus:outline-none"
          >
            {sortOptions.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onStatusFilterChange(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex-shrink-0 ${
              statusFilter === tab.id
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
