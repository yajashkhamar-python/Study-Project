import React, { useState, useEffect } from 'react';
import { noteService } from '../services/noteService';
import { Loader } from '../components/common/Loader';
import { NotesHeader } from '../components/notes/NotesHeader';
import { NotesStats } from '../components/notes/NotesStats';
import { NoteCard } from '../components/notes/NoteCard';
import { NoteModal } from '../components/notes/NoteModal';
import { NoteDetailModal } from '../components/notes/NoteDetailModal';

import { useToast } from '../context/ToastContext';
import { BookOpen, Plus, Pin, AlertCircle } from 'lucide-react';

export const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search State
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [filter, setFilter] = useState('all'); // 'all' | 'pinned' | 'important'
  const [sort, setSort] = useState('updatedAt'); // 'updatedAt' | 'createdAt' | 'titleAsc' | 'titleDesc'

  // Modals state
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { addToast } = useToast();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedSubject !== 'All') params.subject = selectedSubject;
      if (filter !== 'all') params.filter = filter;
      if (sort) params.sort = sort;

      const res = await noteService.getNotes(params);
      if (res.success) {
        setNotes(res.data || []);
      } else {
        setError('Failed to load study notes.');
      }
    } catch (err) {
      console.error('Fetch notes error:', err);
      setError(err.response?.data?.message || 'Unable to connect to study notes service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [search, selectedSubject, filter, sort]);

  // Derived subjects list for filter dropdown
  const availableSubjects = Array.from(
    new Set(notes.map((n) => n.subject).filter(Boolean))
  );

  // Handlers
  const handleOpenCreateModal = () => {
    setNoteToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (note) => {
    setIsDetailModalOpen(false);
    setNoteToEdit(note);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (note) => {
    setSelectedNote(note);
    setIsDetailModalOpen(true);
  };

  const handleCreateOrUpdateNote = async (formData) => {
    try {
      if (noteToEdit) {
        const res = await noteService.updateNote(noteToEdit._id, formData);
        if (res.success) {
          addToast('Note updated successfully!', 'success');
          fetchNotes();
        }
      } else {
        const res = await noteService.createNote(formData);
        if (res.success) {
          addToast('Note created successfully!', 'success');
          fetchNotes();
        }
      }
    } catch (err) {
      console.error('Save note error:', err);
      addToast(err.response?.data?.message || 'Failed to save note', 'error');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const res = await noteService.deleteNote(noteId);
      if (res.success) {
        addToast('Note deleted successfully', 'info');
        fetchNotes();
      }
    } catch (err) {
      console.error('Delete note error:', err);
      addToast('Failed to delete note', 'error');
    }
  };

  const handleTogglePin = async (noteId) => {
    try {
      const res = await noteService.togglePin(noteId);
      if (res.success) {
        fetchNotes();
      }
    } catch (err) {
      addToast('Failed to update pin status', 'error');
    }
  };

  const handleToggleImportant = async (noteId) => {
    try {
      const res = await noteService.toggleImportant(noteId);
      if (res.success) {
        fetchNotes();
      }
    } catch (err) {
      addToast('Failed to update important status', 'error');
    }
  };

  const pinnedNotes = notes.filter((n) => n.isPinned);
  const otherNotes = notes.filter((n) => !n.isPinned);

  if (loading && notes.length === 0) return <Loader fullScreen />;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header & Controls */}
      <NotesHeader
        search={search}
        onSearchChange={setSearch}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        subjects={availableSubjects}
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
        onOpenCreateModal={handleOpenCreateModal}
      />

      {/* Stats Counter Bar */}
      <NotesStats notes={notes} />

      {/* Error Retry Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-400 text-xs font-bold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchNotes}
            className="px-3 py-1 rounded-xl bg-rose-600 text-white font-black hover:bg-rose-500 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content Grid & Sections */}
      {notes.length === 0 && !loading ? (
        /* Empty State */
        <div className="glass-card p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">No study notes yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Create your first note and start building your personal course knowledge library.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/30 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Note</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && filter !== 'important' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-400">
                <Pin className="w-4 h-4 fill-purple-400" />
                <span>Pinned Notes ({pinnedNotes.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onSelect={handleOpenDetailModal}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                    onToggleImportant={handleToggleImportant}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Notes / Other Notes Section */}
          <div className="space-y-3">
            {pinnedNotes.length > 0 && filter !== 'important' && (
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 pt-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>All Notes ({otherNotes.length})</span>
              </div>
            )}

            {(pinnedNotes.length === 0 ? notes : otherNotes).length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-medium glass-card rounded-3xl border border-slate-800">
                No matching notes found for current filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(pinnedNotes.length === 0 || filter === 'important' ? notes : otherNotes).map(
                  (note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onSelect={handleOpenDetailModal}
                      onEdit={handleOpenEditModal}
                      onDelete={handleDeleteNote}
                      onTogglePin={handleTogglePin}
                      onToggleImportant={handleToggleImportant}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Note Create/Edit Modal */}
      <NoteModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleCreateOrUpdateNote}
        noteToEdit={noteToEdit}
        availableSubjects={availableSubjects}
      />

      {/* Note Detail Reading Modal */}
      <NoteDetailModal
        note={selectedNote}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteNote}
        onTogglePin={handleTogglePin}
        onToggleImportant={handleToggleImportant}
      />
    </div>
  );
};

export default NotesPage;
