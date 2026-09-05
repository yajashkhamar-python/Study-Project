import API from './api';

export const calendarService = {
  /**
   * Fetch aggregated calendar events and today panel data
   */
  getCalendarData: async () => {
    const response = await API.get('/calendar');
    return response.data;
  },
};
