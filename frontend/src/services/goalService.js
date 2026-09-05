import API from './api';

export const goalService = {
  /**
   * Fetch user's goals with optional search & filter params
   * @param {Object} params - { search, status, priority, category, sortBy }
   */
  getGoals: async (params = {}) => {
    const response = await API.get('/goals', { params });
    return response.data;
  },

  /**
   * Fetch single goal with linked tasks
   */
  getGoal: async (id) => {
    const response = await API.get(`/goals/${id}`);
    return response.data;
  },

  /**
   * Create a new goal
   * @param {Object} data - { title, description, category, priority, startDate, targetDate, milestones }
   */
  createGoal: async (data) => {
    const response = await API.post('/goals', data);
    return response.data;
  },

  /**
   * Update goal details
   */
  updateGoal: async (id, data) => {
    const response = await API.put(`/goals/${id}`, data);
    return response.data;
  },

  /**
   * Delete goal by ID
   */
  deleteGoal: async (id) => {
    const response = await API.delete(`/goals/${id}`);
    return response.data;
  },

  /**
   * Add a milestone to existing goal
   */
  addMilestone: async (goalId, data) => {
    const response = await API.post(`/goals/${goalId}/milestones`, data);
    return response.data;
  },

  /**
   * Toggle milestone completion
   */
  toggleMilestone: async (goalId, milestoneId) => {
    const response = await API.patch(`/goals/${goalId}/milestones/${milestoneId}/toggle`);
    return response.data;
  },

  /**
   * Delete milestone from goal
   */
  deleteMilestone: async (goalId, milestoneId) => {
    const response = await API.delete(`/goals/${goalId}/milestones/${milestoneId}`);
    return response.data;
  },
};
