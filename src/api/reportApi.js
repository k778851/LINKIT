import { api } from './apiClient';

/**
 * 신고 API
 * - targetType: 'USER' | 'POST' | 'COMMENT' | 'CLUB' | 'CLUB_POST'
 * - reason:     'SPAM' | 'ABUSE' | 'ILLEGAL' | 'PORNOGRAPHY' | 'OTHER'
 * - status:     'PENDING' | 'RESOLVED' | 'DISMISSED'
 */
export const reportApi = {
  /** 신고 접수 */
  create: ({ targetType, targetId, reason, detail }) =>
    api.post('/api/reports', { targetType, targetId, reason, detail }),

  /** 관리자: 신고 목록 (status 필터 옵션) */
  listForAdmin: ({ status, page = 0, size = 20 } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    params.set('page', String(page));
    params.set('size', String(size));
    return api.get(`/api/admin/reports?${params.toString()}`);
  },

  /** 관리자: 신고 처리 (RESOLVED / DISMISSED) */
  updateStatus: (reportId, status) =>
    api.patch(`/api/admin/reports/${reportId}`, { status }),
};
