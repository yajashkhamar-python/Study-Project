import API from './api';

export const authService = {
  async register(userData) {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },

  async logout() {
    const response = await API.post('/auth/logout');
    return response.data;
  },

  async getMe() {
    const response = await API.get('/auth/me');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await API.put('/auth/me', profileData);
    return response.data;
  },
};
