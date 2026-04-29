import { create } from 'zustand';
import { notificationApi } from '../api/notificationApi';
import { ApiError } from '../api/apiClient';

const INITIAL = [
  { id: 'n1', type: 'comment',    icon: '💬', title: '링킷유저님의 게시글에 댓글이 달렸어요', body: '봄바람: 저도 가고 싶어요!!',            time: '방금 전',  read: false, path: '/community/post-1' },
  { id: 'n2', type: 'like',       icon: '❤️', title: '내 게시글에 좋아요가 3개 달렸어요',    body: '"같이 꽃 보러 가실분!!!"',              time: '1시간 전', read: false, path: '/community/post-1' },
  { id: 'n3', type: 'club',       icon: '🏃', title: '러닝 크루 — 모임이 내일이에요!',       body: '04/26 (토) 20:00 · 여의도',            time: '2시간 전', read: false, path: '/clubs/club-1'     },
  { id: 'n4', type: 'new_member', icon: '👋', title: '풋살 크루에 새 멤버 12명이 가입했어요', body: '지금 312명이 함께하고 있어요',            time: '5시간 전', read: true,  path: '/clubs/club-6'     },
  { id: 'n5', type: 'comment',    icon: '💬', title: '내 댓글에 답글이 달렸어요',            body: '총무: 토요일 오후 2시 맞죠?',            time: '1일 전',   read: true,  path: '/community/post-1' },
  { id: 'n6', type: 'system',     icon: '📣', title: 'LINKIT 새 기능 안내',                 body: '동네 기반 모임 추천 기능이 추가됐어요!',  time: '2일 전',   read: true,  path: null                },
  { id: 'n7', type: 'club',       icon: '📸', title: '감성 사진 모임 — 이번 달 출사 일정 공유', body: '05/11 (일) 성수동 카페거리',            time: '3일 전',   read: true,  path: '/clubs/club-3'     },
];

export const useNotificationStore = create((set, get) => ({
  notifications: INITIAL,

  get unreadCount() {
    return get().notifications.filter((n) => !n.read).length;
  },

  /* ── API: 서버 알림 로드 ──────────────────────────────── */
  fetchNotifications: async () => {
    try {
      const list = await notificationApi.getAll();
      // 서버 알림 + 로컬 생성 알림 병합 (중복 제거)
      set((s) => {
        const serverIds = new Set(list.map((n) => n.id));
        const localOnly = s.notifications.filter((n) => !serverIds.has(n.id));
        return { notifications: [...list, ...localOnly] };
      });
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 0)) throw e;
      // 오프라인 → 로컬 유지
    }
  },

  /* ── 로컬 알림 추가 (다른 스토어에서 호출) ─────────────── */
  addNotification: (notif) =>
    set((s) => ({
      notifications: [
        { id: `n-${Date.now()}`, time: '방금 전', read: false, path: null, ...notif },
        ...s.notifications,
      ],
    })),

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

  deleteNotif: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),
}));
