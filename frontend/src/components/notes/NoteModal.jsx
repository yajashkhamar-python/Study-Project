import React, { useState, useEffect } from 'react';
import { X, Plus, Tag, BookOpen, Pin, Star, Palette } from 'lucide-react';
import { Button } from '../common/Button';

const COLOR_OPTIONS = [
  { label: 'Indigo', hex: '#6366f1' },
  { label: 'Emerald', hex: '#10b981' },
  { label: 'Amber', hex: '#f59e0b' },
  { label: 'Pink', hex: '#ec4899' },
  { label: 'Purple', hex: '#8b5cf6' },
  { label: 'Rose', hex: '#ef4444' },
];

const DEFAULT_SUBJECTS = ['Database Management', 'Data Structures', 'Operating Systems', 'Software Engineering', 'Computer Networks', 'Mathematics', 'General'];

export const NoteModal = ({ isOpen, onClose, onSubmit, noteToEdit = null, availableSubjects = [] }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('General');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);

  const subjectsList = Array.from(new Set([...DEFAULT_SUBJECTS, ...availableSubjects]));

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title || '');
      setSubject(noteToEdit.subject || 'General');
      setContent(noteToEdit.content || '');
      setTags(noteToEdit.tags || []);
      setIsPinned(Boolean(noteToEdit.isPinned));
      setIsImportant(Boolean(noteToEdit.isImportant));
      setColor(noteToEdit.color || '#6366f1');
    } else {
      setTitle('');
      setSubject('General');
      setContent('');
      setTags([]);
      setIsPinned(false);
      setIsImportant(false);
      setColor('#6366f1');
    }
  }, [noteToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/^#/, '');
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setLoading(true);
      await onSubmit({
        title: title.trim(),
        content,
        subject,
        tags,
        isPinned,
        isImportant,
        color,
      });
      onClose();
    } catch (err) {
      console.error('Submit note error:', err);
    } finally {
      setLoading(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="glass-card w-full max-w-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {noteToEdit ? 'Edit Study Note' : 'Create New Study Note'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Store notes, revision points, and Markdown code snippets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Note Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Note Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Normalization & Normal Forms (1NF, 2NF, 3NF)"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Subject Selector & Color Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Subject / Course
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
              >
                {subjectsList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-indigo-400" /> Color Accent
              </label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c.hex ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Tags (Press Enter or Comma)
            </label>
            <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? 'Type tag and press Enter...' : 'Add another tag...'}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none flex-1 min-w-[120px]"
              />
            </div>
          </div>

          {/* Markdown Content Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Note Content (Markdown Supported) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                {wordCount} words • {charCount} chars
              </span>
            </div>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Introduction to Normalization&#10;&#10;Database normalization minimizes data redundancy...&#10;&#10;- 1NF: Atomic values&#10;- 2NF: No partial dependency&#10;- 3NF: No transitive dependency"
              className="w-full p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Checkboxes: Pin & Important */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'text-purple-400 fill-purple-400' : 'text-slate-400'}`} />
              <span>Pin to top</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <Star className={`w-3.5 h-3.5 ${isImportant ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
              <span>Mark as Important</span>
            </label>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/80">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {noteToEdit ? 'Save Changes' : 'Create Note'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
