import { api } from './apiClient';

export const userApi = {
  /** 내 프로필 */
  getMe:         ()       => api.get('/api/users/me'),

  /** 프로필 수정 */
  updateMe:      (data)   => api.put('/api/users/me', data),

  /** 특정 유저 조회 */
  getUser:       (userId) => api.get(`/api/users/${userId}`),

  /** 찜 토글 */
  toggleBookmark:(clubId) => api.post(`/api/clubs/${clubId}/bookmark`),
};
