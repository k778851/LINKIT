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

  /** 모임 신청 — 공개 클럽: 즉시 가입(JOINED), 비공개: 신청 접수(PENDING) */
  join:     (clubId, message) => api.post(`/api/clubs/${clubId}/join`, message ? { message } : {}),

  /** 참여 취소 */
  leave:    (clubId) => api.delete(`/api/clubs/${clubId}/join`),

  /** 찜 토글 */
  bookmark: (clubId) => api.post(`/api/clubs/${clubId}/bookmark`),

  /* ── 비공개 클럽 가입 신청 ── */
  /** 가입 신청 목록 (클럽 OWNER/ADMIN 전용) */
  listJoinRequests:   (clubId) => api.get(`/api/clubs/${clubId}/join-requests`),
  /** 가입 신청 (별칭 - join이 자동 분기되므로 보통 join을 사용) */
  requestJoin:        (clubId, message) => api.post(`/api/clubs/${clubId}/join-requests`, { message }),
  /** 가입 신청 승인 */
  approveJoinRequest: (clubId, requestId) => api.patch(`/api/clubs/${clubId}/join-requests/${requestId}/approve`),
  /** 가입 신청 거절 */
  rejectJoinRequest:  (clubId, requestId) => api.patch(`/api/clubs/${clubId}/join-requests/${requestId}/reject`),

  /* ── 멤버 역할 변경 ── */
  /** 멤버 역할 변경 (OWNER만 가능) — newRole: 'MEMBER' | 'ADMIN' */
  changeMemberRole: (clubId, userId, newRole) =>
    api.patch(`/api/clubs/${clubId}/members/${userId}/role`, { role: newRole }),

  /* ── 클럽 게시판 ── */
  getPosts:     (clubId)       => api.get(`/api/clubs/${clubId}/posts`),
  createPost:   (clubId, data) => api.post(`/api/clubs/${clubId}/posts`, data),
  deletePost:   (clubId, postId) => api.delete(`/api/clubs/${clubId}/posts/${postId}`),

  /* ── 클럽 일정 ── */
  getSchedules: (clubId) => api.get(`/api/clubs/${clubId}/schedules`),
};
