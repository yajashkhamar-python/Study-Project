import API from './api';

export const noteService = {
  /**
   * Fetch notes with optional search, subject filter, status filter, and sort
   */
  getNotes: async (params = {}) => {
    const response = await API.get('/notes', { params });
    return response.data;
  },

  /**
   * Fetch single note by ID
   */
  getNote: async (id) => {
    const response = await API.get(`/notes/${id}`);
    return response.data;
  },

  /**
   * Create new note
   */
  createNote: async (data) => {
    const response = await API.post('/notes', data);
    return response.data;
  },

  /**
   * Update existing note
   */
  updateNote: async (id, data) => {
    const response = await API.put(`/notes/${id}`, data);
    return response.data;
  },

  /**
   * Delete note
   */
  deleteNote: async (id) => {
    const response = await API.delete(`/notes/${id}`);
    return response.data;
  },

  /**
   * Toggle pin status of note
   */
  togglePin: async (id) => {
    const response = await API.patch(`/notes/${id}/pin`);
    return response.data;
  },

  /**
   * Toggle important status of note
   */
  toggleImportant: async (id) => {
    const response = await API.patch(`/notes/${id}/important`);
    return response.data;
  },
  /**
   * Process Note AI action (summarize, explain, quiz, flashcards)
   */
  processNoteAI: async (id, action) => {
    const response = await API.post(`/notes/${id}/ai`, { action });
    return response.data;
  },
};

