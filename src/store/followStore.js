import { create } from 'zustand';
import { userApi } from '../api/userApi';
import { ApiError } from '../api/apiClient';
import { SAMPLE_USERS } from '../data/sampleData';

/** 오프라인 데모용 샘플 팔로우 데이터 */
const DEMO_FOLLOWERS = {
  'user-me': [
    SAMPLE_USERS['user-1'],
    SAMPLE_USERS['user-3'],
    SAMPLE_USERS['user-6'],
    SAMPLE_USERS['user-8'],
    SAMPLE_USERS['user-9'],
    SAMPLE_USERS['user-10'],
    { id: 'user-2', nickname: '피자러버' },
  ],
};
const DEMO_FOLLOWING = {
  'user-me': [
    SAMPLE_USERS['user-1'],
    SAMPLE_USERS['user-3'],
    SAMPLE_USERS['user-6'],
    SAMPLE_USERS['user-5'],
    SAMPLE_USERS['user-8'],
  ],
};
const DEMO_STATS = {
  'user-me': { followerCount: 7, followingCount: 5, isFollowing: false },
  'user-1':  { followerCount: 24, followingCount: 12, isFollowing: false },
  'user-2':  { followerCount: 18, followingCount: 31, isFollowing: false },
  'user-3':  { followerCount: 67, followingCount: 45, isFollowing: false },
  'user-4':  { followerCount: 42, followingCount: 38, isFollowing: false },
  'user-5':  { followerCount: 15, followingCount: 22, isFollowing: false },
  'user-6':  { followerCount: 89, followingCount: 54, isFollowing: false },
};

/**
 * 팔로우/팔로잉 상태 관리
 * - stats:       { [userId]: { followerCount, followingCount, isFollowing } }
 * - followers:   { [userId]: UserSummary[] }
 * - following:   { [userId]: UserSummary[] }
 */
export const useFollowStore = create((set, get) => ({
  stats:     DEMO_STATS,
  followers: DEMO_FOLLOWERS,
  following: DEMO_FOLLOWING,

  /* ── 통계 로드 ─────────────────────────────────────── */
  fetchStats: async (userId) => {
    try {
      const data = await userApi.followStats(userId);
      set((s) => ({ stats: { ...s.stats, [userId]: data } }));
    } catch (e) {
      if (e instanceof ApiError && e.status === 0) return; // 오프라인 → DEMO_STATS 유지
    }
  },

  /* ── 팔로워 목록 ────────────────────────────────────── */
  fetchFollowers: async (userId) => {
    try {
      const data = await userApi.getFollowers(userId);
      set((s) => ({ followers: { ...s.followers, [userId]: data } }));
    } catch (e) {
      if (e instanceof ApiError && e.status === 0) return; // 오프라인 → DEMO_FOLLOWERS 유지
    }
  },

  /* ── 팔로잉 목록 ────────────────────────────────────── */
  fetchFollowing: async (userId) => {
    try {
      const data = await userApi.getFollowing(userId);
      set((s) => ({ following: { ...s.following, [userId]: data } }));
    } catch (e) {
      if (e instanceof ApiError && e.status === 0) return; // 오프라인 → DEMO_FOLLOWING 유지
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
