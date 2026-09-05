import API from './api';

export const dashboardService = {
  async getDashboardStats() {
    const response = await API.get('/dashboard/stats');
    return response.data;
  },

  async getWeeklyActivity() {
    const response = await API.get('/dashboard/weekly');
    return response.data;
  },
};
