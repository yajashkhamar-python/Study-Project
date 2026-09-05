import API from './api';

export const analyticsService = {
  /**
   * Fetch aggregated analytics dashboard metrics
   * @param {string} range - '7days' | '30days' | '90days' | 'all'
   */
  getAnalytics: async (range = '7days') => {
    const response = await API.get('/analytics', {
      params: { range },
    });
    return response.data;
  },

  /**
   * Log completed focus session
   * @param {Object} data - { durationMinutes, mode, subject, taskId }
   */
  logFocusSession: async (data) => {
    const response = await API.post('/analytics/focus-session', data);
    return response.data;
  },
};
