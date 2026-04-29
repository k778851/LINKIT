import { api } from './apiClient';

export const clubApi = {
  /** 목록 조회 */
  getAll:   (category = '전체', sort = '최신순') =>
    api.get(`/api/clubs?category=${encodeURIComponent(category)}&sort=${encodeURIComponent(sort)}`),

  /** 상세 조회 */
  getById:  (clubId) => api.get(`/api/clubs/${clubId}`),

  /** 클럽 생성 */
  create:   (data)   => api.post('/api/clubs', data),

  /** 클럽 수정 */
  update:   (clubId, data) => api.put(`/api/clubs/${clubId}`, data),

  /** 클럽 삭제 */
  remove:   (clubId) => api.delete(`/api/clubs/${clubId}`),

  /** 모임 신청 */
  join:     (clubId) => api.post(`/api/clubs/${clubId}/join`),

  /** 참여 취소 */
  leave:    (clubId) => api.delete(`/api/clubs/${clubId}/join`),

  /** 찜 토글 */
  bookmark: (clubId) => api.post(`/api/clubs/${clubId}/bookmark`),

  /* ── 클럽 게시판 ── */
  getPosts:     (clubId)       => api.get(`/api/clubs/${clubId}/posts`),
  createPost:   (clubId, data) => api.post(`/api/clubs/${clubId}/posts`, data),
  deletePost:   (clubId, postId) => api.delete(`/api/clubs/${clubId}/posts/${postId}`),

  /* ── 클럽 일정 ── */
  getSchedules: (clubId) => api.get(`/api/clubs/${clubId}/schedules`),
};
