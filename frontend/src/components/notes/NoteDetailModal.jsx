import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Edit3, Trash2, Copy, Check, Pin, Star, Clock, FileText, Tag, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { NoteAIToolbar } from './NoteAIToolbar';
import { NoteAIResultModal } from './NoteAIResultModal';
import { noteService } from '../../services/noteService';

export const NoteDetailModal = ({
  note,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleImportant,
}) => {
  const [copied, setCopied] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // AI Tools State
  const [aiLoading, setAiLoading] = useState(false);
  const [activeAIAction, setActiveAIAction] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiAction, setAiAction] = useState(null);
  const [aiTruncated, setAiTruncated] = useState(false);
  const [isAIResultOpen, setIsAIResultOpen] = useState(false);

  const { addToast } = useToast();

  if (!isOpen || !note) return null;

  const { _id, title, content, subject, tags = [], isPinned, isImportant, color, updatedAt, wordCount } = note;

  const handleCopyContent = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    addToast('Note content copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteConfirm = () => {
    onDelete(_id);
    setShowConfirmDelete(false);
    onClose();
  };

  const handleTriggerAI = async (actionType) => {
    try {
      setAiLoading(true);
      setActiveAIAction(actionType);
      const res = await noteService.processNoteAI(_id, actionType);
      if (res.success) {
        setAiResult(res.result);
        setAiAction(res.action);
        setAiTruncated(Boolean(res.truncated));
        setIsAIResultOpen(true);
      } else {
        addToast('StudyPulse AI couldn\'t process this note right now.', 'error');
      }
    } catch (err) {
      console.error('Note AI processing error:', err);
      addToast('StudyPulse AI couldn\'t process this note right now.', 'error');
    } finally {
      setAiLoading(false);
      setActiveAIAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="glass-card w-full max-w-3xl rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col shadow-2xl overflow-hidden my-6 max-h-[90vh]">
        {/* Modal Top Header Bar */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-sm"
              style={{ backgroundColor: color || '#6366f1' }}
            >
              {subject || 'General'}
            </span>

            {isPinned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-extrabold border border-purple-500/30">
                <Pin className="w-3 h-3 fill-purple-300" /> Pinned
              </span>
            )}

            {isImportant && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold border border-amber-500/30">
                <Star className="w-3 h-3 fill-amber-300" /> Important
              </span>
            )}
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyContent}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Copy Content"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(note);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 transition-colors"
              title="Edit Note"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
              title="Delete Note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content View */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Note Title & Meta */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </h2>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Updated {new Date(updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                <span>{wordCount || content.split(/\s+/).length} words</span>
              </span>
            </div>
          </div>

          {/* AI Tools Section */}
          <NoteAIToolbar
            onAction={handleTriggerAI}
            activeAction={activeAIAction}
            loading={aiLoading}
          />

          {/* Tags list */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-200/60 dark:bg-slate-900/60 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-slate-800"
                >
                  <Tag className="w-3 h-3 text-indigo-400" />
                  <span>#{tag}</span>
                </span>
              ))}
            </div>
          )}

          {/* Rendered Markdown Body */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm font-medium leading-relaxed bg-slate-100/50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/60 overflow-x-auto">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>

        {/* Modal Bottom Footer Bar */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTogglePin(_id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors ${
                isPinned
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>{isPinned ? 'Unpin' : 'Pin Note'}</span>
            </button>

            <button
              onClick={() => onToggleImportant(_id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors ${
                isImportant
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>{isImportant ? 'Unmark Important' : 'Mark Important'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs"
          >
            Close
          </button>
        </div>
      </div>

      {/* Note AI Result Popover Modal */}
      <NoteAIResultModal
        isOpen={isAIResultOpen}
        onClose={() => setIsAIResultOpen(false)}
        action={aiAction}
        result={aiResult}
        truncated={aiTruncated}
        onRegenerate={handleTriggerAI}
        loading={aiLoading}
      />

      {/* Delete Confirmation Overlay Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="glass-card w-full max-w-md p-6 rounded-3xl border border-rose-500/30 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 rounded-2xl bg-rose-500/10">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">Delete Note?</h4>
                <p className="text-xs text-slate-400 font-medium">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Are you sure you want to delete note <strong className="text-white">"{title}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25"
              >
                Yes, Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
