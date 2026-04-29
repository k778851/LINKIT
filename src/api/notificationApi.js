import { api } from './apiClient';

export const notificationApi = {
  /** 내 알림 목록 */
  getAll:      () => api.get('/api/notifications'),

  /** 미읽음 수 */
  unreadCount: () => api.get('/api/notifications/unread-count'),

  /** 단건 읽음 */
  markRead:    (id) => api.patch(`/api/notifications/${id}/read`),

  /** 전체 읽음 */
  markAllRead: () => api.patch('/api/notifications/read-all'),
};
