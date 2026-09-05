import API from './api';

export const taskService = {
  async getTasks(params = {}) {
    const response = await API.get('/tasks', { params });
    return response.data;
  },

  async createTask(taskData) {
    const response = await API.post('/tasks', taskData);
    return response.data;
  },

  async getTaskById(id) {
    const response = await API.get(`/tasks/${id}`);
    return response.data;
  },

  async updateTask(id, taskData) {
    const response = await API.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  async updateTaskStatus(id, status) {
    const response = await API.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  async deleteTask(id) {
    const response = await API.delete(`/tasks/${id}`);
    return response.data;
  },

  async importTasks(tasks) {
    const response = await API.post('/tasks/import', { tasks });
    return response.data;
  },
};
