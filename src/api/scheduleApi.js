import { api } from './apiClient';

export const scheduleApi = {
  /** 내 일정 (가입 클럽 기준) */
  getMine:  () => api.get('/api/schedules/me'),

  /** 일정 등록 (클럽장) */
  create:   (data) => api.post('/api/schedules', data),

  /** 일정 삭제 (클럽장) */
  remove:   (scheduleId) => api.delete(`/api/schedules/${scheduleId}`),
};
