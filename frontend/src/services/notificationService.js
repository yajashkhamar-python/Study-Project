import API from './api';

export const notificationService = {
  async getNotifications() {
    const response = await API.get('/notifications');
    return response.data;
  },

  async markAsRead(id) {
    const response = await API.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await API.patch('/notifications/read-all');
    return response.data;
  },

  async deleteNotification(id) {
    const response = await API.delete(`/notifications/${id}`);
    return response.data;
  },
};
