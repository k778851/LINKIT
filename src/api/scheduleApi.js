import { api } from './apiClient';

export const scheduleApi = {
  getMine:  () => api.get('/api/schedules/me'),
  create:   (data) => api.post('/api/schedules', data),
  remove:   (scheduleId) => api.delete(`/api/schedules/${scheduleId}`),
  apply:    (scheduleId) => api.post(`/api/schedules/${scheduleId}/attendees`),
  cancel:   (scheduleId) => api.delete(`/api/schedules/${scheduleId}/attendees`),
};
