import API from './api';

export const aiService = {
  /**
   * Fetch user's saved conversations list
   */
  getConversations: async () => {
    const response = await API.get('/ai/conversations');
    return response.data;
  },

  /**
   * Fetch single conversation by ID with full messages
   */
  getConversation: async (id) => {
    const response = await API.get(`/ai/conversations/${id}`);
    return response.data;
  },

  /**
   * Delete a conversation by ID
   */
  deleteConversation: async (id) => {
    const response = await API.delete(`/ai/conversations/${id}`);
    return response.data;
  },

  /**
   * Send chat message to StudyPulse AI
   * @param {string} message - Current prompt message
   * @param {Array} conversationHistory - Array of past messages [{ role: 'user'|'assistant', content: string }]
   * @param {string} conversationId - Optional conversation ID
   */
  sendMessage: async (message, conversationHistory = [], conversationId = null) => {
    const response = await API.post('/ai/chat', {
      message,
      conversationHistory,
      conversationId,
    });
    return response.data;
  },

  /**
   * Generate personalized study plan
   * @param {Object} preferences - { dailyMinutes, days, focus }
   */
  generateStudyPlan: async (preferences) => {
    const response = await API.post('/ai/study-plan', preferences);
    return response.data;
  },
};

