import { api } from './apiClient';

export const adminApi = {
  /* 대시보드 */
  getStats:    () => api.get('/api/admin/stats'),

  /* 유저 */
  getUsers:    (q = '') => api.get(`/api/admin/users?q=${encodeURIComponent(q)}`),
  deleteUser:  (userId) => api.delete(`/api/admin/users/${userId}`),

  /* 클럽 */
  getClubs:    (q = '') => api.get(`/api/admin/clubs?q=${encodeURIComponent(q)}`),
  deleteClub:  (clubId) => api.delete(`/api/admin/clubs/${clubId}`),

  /* 게시글 */
  getPosts:    (q = '') => api.get(`/api/admin/posts?q=${encodeURIComponent(q)}`),
  deletePost:  (postId) => api.delete(`/api/admin/posts/${postId}`),
};
