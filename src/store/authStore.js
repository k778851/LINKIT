import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultUser } from '../data/sampleData';
import { useNotificationStore } from './notificationStore';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';
import { tokenStorage, refreshTokenStorage, ApiError } from '../api/apiClient';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      /* ── API 로그인 ────────────────────────────────────── */
      loginWithApi: async (handle, password) => {
        const data = await authApi.login(handle, password);
        tokenStorage.set(data.token);
        if (data.refreshToken) refreshTokenStorage.set(data.refreshToken);
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data.user;
      },

      /* ── 로컬 로그인 (개발/데모용 — 백엔드 미실행 시) ─── */
      login: (user) => set({ user, isAuthenticated: true }),

      logout: () => {
        const refreshToken = refreshTokenStorage.get();
        // 서버에 Refresh Token 폐기 요청 (실패해도 로컬 정리는 계속)
        authApi.logout(refreshToken).catch(() => {});
        tokenStorage.remove();
        refreshTokenStorage.remove();
        set({ user: null, token: null, isAuthenticated: false });
      },

      /* ── 로컬 회원가입 (온보딩 플로우) ──────────────────── */
      register: (nickname) => {
        const newUser = {
          ...defaultUser,
          nickname,
          id: 'user-me',
          createdAt: new Date().toISOString(),
        };
        set({ user: newUser, isAuthenticated: true });
      },

      /* ── 프로필 ─────────────────────────────────────────── */
      updateProfile: (patch) =>
        set((s) => ({ user: { ...s.user, ...patch } })),

      updateProfileWithApi: async (patch) => {
        try {
          const updated = await userApi.updateMe(patch);
          set({ user: updated });
        } catch (e) {
          if (e instanceof ApiError && e.status === 0) {
            // 오프라인 → 로컬만 업데이트
            set((s) => ({ user: { ...s.user, ...patch } }));
          } else throw e;
        }
      },

      updateSettings: (patch) =>
        set((s) => ({
          user: { ...s.user, settings: { ...s.user?.settings, ...patch } },
        })),

      /* ── 찜 토글 ────────────────────────────────────────── */
      toggleBookmark: (clubId) =>
        set((s) => {
          const bookmarks = s.user?.bookmarkedClubs ?? [];
          const next = bookmarks.includes(clubId)
            ? bookmarks.filter((id) => id !== clubId)
            : [...bookmarks, clubId];
          return { user: { ...s.user, bookmarkedClubs: next } };
        }),

      toggleBookmarkWithApi: async (clubId) => {
        // 낙관적 업데이트 먼저
        get().toggleBookmark(clubId);
        try {
          await userApi.toggleBookmark(clubId);
        } catch (e) {
          if (!(e instanceof ApiError && e.status === 0)) {
            // 실패 시 롤백
            get().toggleBookmark(clubId);
            throw e;
          }
        }
      },

      /* ── 클럽 가입 ──────────────────────────────────────── */
      joinClub: (clubId, clubInfo) =>
        set((s) => {
          const joined = s.user?.joinedClubs ?? [];
          if (joined.includes(clubId)) return s;

          if (clubInfo) {
            useNotificationStore.getState().addNotification({
              type: 'club', icon: '🏘️',
              title: `${clubInfo.name} 모임에 가입했어요!`,
              body: `${clubInfo.memberCount + 1}명이 함께하고 있어요`,
              path: `/clubs/${clubId}`,
            });
          }
          return { user: { ...s.user, joinedClubs: [...joined, clubId] } };
        }),

      leaveClub: (clubId) =>
        set((s) => ({
          user: {
            ...s.user,
            joinedClubs: (s.user?.joinedClubs ?? []).filter((id) => id !== clubId),
          },
        })),

      /* ── 서버에서 최신 프로필 동기화 ────────────────────── */
      syncProfile: async () => {
        try {
          const user = await userApi.getMe();
          set({ user });
        } catch {
          // 오프라인이면 무시
        }
      },
    }),
    { name: 'linkit-auth' }
  )
);
