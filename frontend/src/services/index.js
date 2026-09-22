import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const incomesService = {
  list: (params) => api.get('/incomes', { params }),
  create: (data) => api.post('/incomes', data),
  update: (id, data) => api.put(`/incomes/${id}`, data),
  remove: (id) => api.delete(`/incomes/${id}`),
  receive: (id) => api.patch(`/incomes/${id}/receive`),
};

export const expensesService = {
  list: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  remove: (id) => api.delete(`/expenses/${id}`),
  pay: (id) => api.patch(`/expenses/${id}/pay`),
  upcoming: () => api.get('/expenses/upcoming'),
};

export const investmentsService = {
  list: (params) => api.get('/investments', { params }),
  create: (data) => api.post('/investments', data),
  update: (id, data) => api.put(`/investments/${id}`, data),
  remove: (id) => api.delete(`/investments/${id}`),
};

export const summaryService = {
  get: (year, month) => api.get(`/summary/${year}/${month}`),
};

export const categoriesService = {
  list: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const webhooksService = {
  test: () => api.post('/webhooks/test'),
  logs: () => api.get('/webhooks/logs'),
};
