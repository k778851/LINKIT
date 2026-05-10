import { create } from 'zustand';
import { notificationApi } from '../api/notificationApi';
import { ApiError } from '../api/apiClient';
import { formatRelativeTime } from '../utils/formatDate';

/** 서버 응답 알림 → 스토어 포맷으로 변환 */
function normalize(n) {
  return {
    id:    n.id,
    type:  n.type,
    icon:  n.icon,
    title: n.title,
    body:  n.body,
    path:  n.path ?? null,
    read:  n.isRead ?? n.read ?? false,
    time:  n.createdAt ? formatRelativeTime(n.createdAt) : '방금 전',
  };
}

const DEMO_NOTIFICATIONS = [
  { id: 'n-demo-1', type: 'club',    icon: '🏘️', title: '러닝 크루 모임이 곧 있어요',       body: '이번 주 금요일 20:00 · 여의도 한강공원',    path: '/clubs/club-1',          read: false, time: '1시간 전'  },
  { id: 'n-demo-2', type: 'like',    icon: '❤️', title: '내 게시글에 좋아요가 달렸어요',      body: '"같이 꽃 보러 가실분!!!"',                 path: '/community/post-1',       read: false, time: '3시간 전'  },
  { id: 'n-demo-3', type: 'comment', icon: '💬', title: '내 게시글에 댓글이 달렸어요',        body: '봄바람: 저도 가고 싶어요!!',               path: '/community/post-1',       read: true,  time: '3시간 전'  },
  { id: 'n-demo-4', type: 'club',    icon: '⚽', title: '풋살 크루 새 모임이 열렸어요',       body: '5/17 (토) 15:00 · 오치동 풋살장',          path: '/clubs/club-6',          read: true,  time: '어제'      },
];

export const useNotificationStore = create((set, get) => ({
  notifications: DEMO_NOTIFICATIONS,

  /* ── API: 서버 알림 로드 ────────────────────────────── */
  fetchNotifications: async () => {
    try {
      const list = await notificationApi.getAll();
      const normalized = list.map(normalize);
      set((s) => {
        // 서버에 없는 로컬 전용 알림(id가 'n-'으로 시작) 유지
        const serverIds = new Set(normalized.map((n) => n.id));
        const localOnly = s.notifications.filter(
          (n) => String(n.id).startsWith('n-') && !serverIds.has(n.id)
        );
        return { notifications: [...normalized, ...localOnly] };
      });
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 0)) throw e;
      // 오프라인 → 기존 로컬 상태 유지
    }
  },

  /* ── 로컬 알림 추가 (SSE, 다른 스토어에서 호출) ──────── */
  addNotification: (notif) =>
    set((s) => {
      const normalized = {
        id:   `n-${Date.now()}`,
        time: '방금 전',
        read: false,
        path: null,
        ...notif,
        read: notif.read ?? notif.isRead ?? false,
      };
      if (s.notifications.some((n) => n.id === normalized.id)) return s;
      return { notifications: [normalized, ...s.notifications] };
    }),

  /* ── 읽음 처리 ────────────────────────────────────────── */
  markRead: (id) => {
    set((s) => ({
      notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
    }));
    notificationApi.markRead(id).catch(() => {});
  },

  markAllRead: () => {
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
    notificationApi.markAllRead().catch(() => {});
  },

  /* ── 삭제 (로컬 + API) ────────────────────────────────── */
  deleteNotif: (id) => {
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    }));
    notificationApi.remove(id).catch(() => {});
  },
}));
