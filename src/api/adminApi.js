import { api } from './apiClient';

export const adminApi = {
  getStats: () => api.get('/api/admin/stats'),

  getUsers: (q = '') => api.get(`/api/admin/users?q=${encodeURIComponent(q)}`),
  updateUserStatus: (userId, status) => api.patch(`/api/admin/users/${userId}/status`, { status }),
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),

  getClubs: (q = '') => api.get(`/api/admin/clubs?q=${encodeURIComponent(q)}`),
  updateClubStatus: (clubId, status) => api.patch(`/api/admin/clubs/${clubId}/status`, { status }),
  deleteClub: (clubId) => api.delete(`/api/admin/clubs/${clubId}`),

  getPosts: (q = '') => api.get(`/api/admin/posts?q=${encodeURIComponent(q)}`),
  updatePostStatus: (postId, status) => api.patch(`/api/admin/posts/${postId}/status`, { status }),
  deletePost: (postId) => api.delete(`/api/admin/posts/${postId}`),
};
