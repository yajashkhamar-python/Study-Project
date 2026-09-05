import API from './api';

export const examService = {
  async getExams() {
    const response = await API.get('/exams');
    return response.data;
  },

  async createExam(examData) {
    const response = await API.post('/exams', examData);
    return response.data;
  },

  async getExamById(id) {
    const response = await API.get(`/exams/${id}`);
    return response.data;
  },

  async updateExam(id, examData) {
    const response = await API.put(`/exams/${id}`, examData);
    return response.data;
  },

  async deleteExam(id) {
    const response = await API.delete(`/exams/${id}`);
    return response.data;
  },
};
