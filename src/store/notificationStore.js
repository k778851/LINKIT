import { create } from 'zustand';
import { notificationApi } from '../api/notificationApi';
import { ApiError } from '../api/apiClient';
import { formatRelativeTime } from '../utils/formatDate';

function normalize(n) {
  return {
    id: n.id,
    type: n.type,
    icon: n.icon,
    title: n.title,
    body: n.body,
    path: n.path ?? null,
    read: n.isRead ?? n.read ?? false,
    time: n.createdAt ? formatRelativeTime(n.createdAt) : '방금 전',
  };
}

const DEMO_NOTIFICATIONS = [
  { id: 'n-demo-1', type: 'club', icon: '👥', title: '러닝 크루 모임이 곧 있어요', body: '오늘 20:00 · 여의도 한강공원', path: '/clubs/club-1', read: false, time: '1시간 전' },
  { id: 'n-demo-2', type: 'like', icon: '💙', title: '내 게시글에 좋아요가 눌렸어요', body: '"같이 꽃 보러 가실분!!!"', path: '/community/post-1', read: false, time: '3시간 전' },
  { id: 'n-demo-3', type: 'comment', icon: '💬', title: '내 게시글에 댓글이 달렸어요', body: '봄바람: 저도 가고 싶어요!!', path: '/community/post-1', read: true, time: '3시간 전' },
  { id: 'n-demo-4', type: 'club', icon: '⚽', title: '풋살 크루 새 일정이 열렸어요', body: '5/17 (일) 15:00 · 오치동 풋살장', path: '/clubs/club-6', read: true, time: '어제' },
];

const isOffline = (e) => e instanceof ApiError && (e.status === 0 || e.status === 401 || e.status === 403);

export const useNotificationStore = create((set) => ({
  notifications: DEMO_NOTIFICATIONS,

  fetchNotifications: async () => {
    try {
      const list = await notificationApi.getAll();
      const normalized = list.map(normalize);
      set((s) => {
        const serverIds = new Set(normalized.map((n) => n.id));
        const localOnly = s.notifications.filter((n) => String(n.id).startsWith('n-') && !serverIds.has(n.id));
        return { notifications: [...normalized, ...localOnly] };
      });
    } catch (e) {
      if (!isOffline(e)) throw e;
    }
  },

  addNotification: (notif) =>
    set((s) => ({
      notifications: [
        {
          id: `n-${Date.now()}`,
          time: '방금 전',
          read: false,
          path: null,
          ...notif,
          read: notif.read ?? notif.isRead ?? false,
        },
        ...s.notifications,
      ],
    })),

  markRead: (id) => {
    set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) }));
    notificationApi.markRead(id).catch(() => {});
  },

  markAllRead: () => {
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
    notificationApi.markAllRead().catch(() => {});
  },

  deleteNotif: (id) => {
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
    notificationApi.remove(id).catch(() => {});
  },
}));
