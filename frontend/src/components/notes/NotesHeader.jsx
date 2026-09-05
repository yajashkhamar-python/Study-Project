import React from 'react';
import { Search, Plus, BookOpen, Filter, ArrowUpDown } from 'lucide-react';

export const NotesHeader = ({
  search,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
  subjects = [],
  filter,
  onFilterChange,
  sort,
  onSortChange,
  onOpenCreateModal,
}) => {
  const filterTabs = [
    { id: 'all', label: 'All Notes' },
    { id: 'pinned', label: '📌 Pinned' },
    { id: 'important', label: '⭐ Important' },
  ];

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-4">
      {/* Title & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Study Workspace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Study Notes 📚
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Organize your course knowledge, revise smarter, and store key concepts.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Controls Bar: Search, Subject Dropdown, Filter Tabs, Sort Dropdown */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-slate-200/50 dark:border-slate-800/80">
        {/* Search & Subject Select */}
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          {/* Live Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, content, or tag..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Subject Dropdown */}
          <select
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Subjects</option>
            {subjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Tabs & Sort Dropdown */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-900/80 border border-slate-300/50 dark:border-slate-800">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onFilterChange(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                  filter === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-300/50 dark:hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-3 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
            >
              <option value="updatedAt">Recently Updated</option>
              <option value="createdAt">Recently Created</option>
              <option value="titleAsc">Title (A-Z)</option>
              <option value="titleDesc">Title (Z-A)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
