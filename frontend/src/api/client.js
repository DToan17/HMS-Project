import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const statsAPI = {
  get: () => api.get('/dashboard/stats'),
  legacy: () => api.get('/stats'),
};

export const patientsAPI = {
  list: (params) => api.get('/patients', { params }),
  get: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};

export const appointmentsAPI = {
  list: (params) => api.get('/appointments', { params }),
  get: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
};

export const doctorsAPI = {
  list: (params) => api.get('/doctors', { params }),
  get: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
};

export const roomsAPI = {
  list: (params) => api.get('/rooms', { params }),
  update: (id, data) => api.put(`/rooms/${id}`, data),
};

export const revenueAPI = {
  get: (params) => api.get('/revenue', { params }),
  create: (data) => api.post('/revenue', data),
};

export default api;
