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

  /* ── 소셜 (팔로우) ── */

  /** 팔로우 토글 (POST) — true: 팔로우됨, false: 언팔로우됨 */
  toggleFollow:  (userId) => api.post(`/api/users/${userId}/follow`),

  /** 팔로우 통계 */
  followStats:   (userId) => api.get(`/api/users/${userId}/follow-stats`),

  /** 팔로워 목록 (나를 팔로우하는 사람) */
  getFollowers:  (userId) => api.get(`/api/users/${userId}/followers`),

  /** 팔로잉 목록 (내가 팔로우하는 사람) */
  getFollowing:  (userId) => api.get(`/api/users/${userId}/following`),
};
