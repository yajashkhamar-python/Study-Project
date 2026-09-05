import React from 'react';
import { Pin, Star, Clock, FileText, Tag, Trash2, Edit3, Eye } from 'lucide-react';

// Helper for relative time formatting
const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const NoteCard = ({
  note,
  onSelect,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleImportant,
}) => {
  const { _id, title, content, subject, tags = [], isPinned, isImportant, color, updatedAt, wordCount } = note;

  // Clean plain-text excerpt preview
  const excerpt = content
    ? content.replace(/<[^>]*>?/gm, '').replace(/[#*_`]/g, '').slice(0, 120) + (content.length > 120 ? '...' : '')
    : 'No content...';

  return (
    <div
      onClick={() => onSelect(note)}
      className="glass-card-hover p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between space-y-4 group cursor-pointer transition-all duration-300 relative overflow-hidden"
    >
      {/* Top Header: Subject Badge + Actions */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm"
          style={{ backgroundColor: color || '#6366f1' }}
        >
          {subject || 'General'}
        </span>

        {/* Pin & Star Quick Toggle Buttons */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onToggleImportant(_id)}
            className={`p-1.5 rounded-xl transition-colors ${
              isImportant
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800/50'
            }`}
            title={isImportant ? 'Unmark Important' : 'Mark Important'}
          >
            <Star className={`w-4 h-4 ${isImportant ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => onTogglePin(_id)}
            className={`p-1.5 rounded-xl transition-colors ${
              isPinned
                ? 'text-purple-400 bg-purple-500/10'
                : 'text-slate-400 hover:text-purple-400 hover:bg-slate-800/50'
            }`}
            title={isPinned ? 'Unpin Note' : 'Pin Note'}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'fill-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Note Title & Excerpt */}
      <div className="space-y-1.5 flex-1">
        <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-400 transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-3">
          {excerpt}
        </p>
      </div>

      {/* Tags List */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-200/60 dark:bg-slate-900/60 border border-slate-300/50 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300"
            >
              <Tag className="w-2.5 h-2.5 text-indigo-400" />
              <span>#{tag}</span>
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-[10px] text-slate-400 font-bold">+{tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Card Footer: Metadata & Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-800/80 text-[10px] font-bold text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Updated {getRelativeTime(updatedAt)}</span>
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3 text-slate-400" />
            <span>{wordCount || 0} words</span>
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(note)}
            className="p-1 rounded-lg hover:text-indigo-400 hover:bg-slate-800/50"
            title="Edit Note"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(_id)}
            className="p-1 rounded-lg hover:text-rose-400 hover:bg-slate-800/50"
            title="Delete Note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
