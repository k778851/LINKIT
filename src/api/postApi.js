import { api } from './apiClient';

export const postApi = {
  /** 목록 (category: 전체·모임·일상·질문·나눔·생활정보·인기) */
  getAll:    (category = '전체') =>
    api.get(`/api/posts?category=${encodeURIComponent(category)}`),

  /** 상세 (조회수 +1 포함) */
  getById:   (postId) => api.get(`/api/posts/${postId}`),

  /** 작성 */
  create:    (data)   => api.post('/api/posts', data),

  /** 수정 */
  update:    (postId, data) => api.put(`/api/posts/${postId}`, data),

  /** 삭제 */
  remove:    (postId) => api.delete(`/api/posts/${postId}`),

  /** 좋아요 토글 */
  toggleLike:(postId) => api.post(`/api/posts/${postId}/like`),

  /** 내 게시글 */
  getMine:   () => api.get('/api/posts/me'),

  /* ── 댓글 ── */
  getComments:  (postId)       => api.get(`/api/posts/${postId}/comments`),
  addComment:   (postId, data) => api.post(`/api/posts/${postId}/comments`, data),
  deleteComment:(commentId)    => api.delete(`/api/comments/${commentId}`),
};
