import { create } from 'zustand';
import { userApi } from '../api/userApi';
import { ApiError } from '../api/apiClient';

/**
 * 팔로우/팔로잉 상태 관리
 * - stats:       { [userId]: { followerCount, followingCount, isFollowing } }
 * - followers:   { [userId]: UserSummary[] }
 * - following:   { [userId]: UserSummary[] }
 */
export const useFollowStore = create((set, get) => ({
  stats:     {},
  followers: {},
  following: {},

  /* ── 통계 로드 ─────────────────────────────────────── */
  fetchStats: async (userId) => {
    try {
      const data = await userApi.followStats(userId);
      set((s) => ({ stats: { ...s.stats, [userId]: data } }));
    } catch (e) {
      if (e instanceof ApiError && e.status === 0) return; // 오프라인 무시
    }
  },

  /* ── 팔로워 목록 ────────────────────────────────────── */
  fetchFollowers: async (userId) => {
    try {
      const data = await userApi.getFollowers(userId);
      set((s) => ({ followers: { ...s.followers, [userId]: data } }));
    } catch (e) {
      if (e instanceof ApiError && e.status === 0) return;
    }
  },

  /* ── 팔로잉 목록 ────────────────────────────────────── */
  fetchFollowing: async (userId) => {
    try {
      const data = await userApi.getFollowing(userId);
      set((s) => ({ following: { ...s.following, [userId]: data } }));
    } catch (e) {
      if (e instanceof ApiError && e.status === 0) return;
    }
  },

  /* ── 팔로우 토글 (낙관적 업데이트) ─────────────────── */
  toggleFollow: async (targetId, myId) => {
    const current = get().stats[targetId] ?? { followerCount: 0, followingCount: 0, isFollowing: false };
    const nowFollowing = !current.isFollowing;

    // 낙관적 업데이트
    set((s) => ({
      stats: {
        ...s.stats,
        [targetId]: {
          ...current,
          isFollowing: nowFollowing,
          followerCount: current.followerCount + (nowFollowing ? 1 : -1),
        },
      },
    }));

    try {
      await userApi.toggleFollow(targetId);
      // 팔로잉 목록도 갱신 (내 팔로잉 목록에서 targetId 제거/추가)
      if (myId) {
        const myFollowing = get().following[myId] ?? [];
        if (nowFollowing) {
          // 새로운 팔로잉 추가 (상세 정보는 stats에서만 관리, 목록은 다시 fetch)
          get().fetchFollowing(myId);
        } else {
          set((s) => ({
            following: {
              ...s.following,
              [myId]: myFollowing.filter((u) => u.id !== targetId),
            },
          }));
        }
      }
    } catch (e) {
      // 롤백
      set((s) => ({
        stats: { ...s.stats, [targetId]: current },
      }));
      if (!(e instanceof ApiError && e.status === 0)) throw e;
    }
  },
}));
