import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sampleClubs, sampleSchedules } from '../data/sampleData';
import { clubApi } from '../api/clubApi';
import { ApiError } from '../api/apiClient';

export const useClubStore = create(
  persist(
    (set, get) => ({
      clubs:            sampleClubs,
      pendingClubs:     [],      // 관리자 승인 대기 중인 클럽
      schedules:        sampleSchedules,
      selectedCategory: '전체',
      selectedSort:     '최신순',
      loaded:           false,   // API에서 한 번이라도 로드했는지

      setCategory: (category) => set({ selectedCategory: category }),
      setSort:     (sort)     => set({ selectedSort: sort }),

      /* ── API: 클럽 목록 로드 ──────────────────────────── */
      fetchClubs: async () => {
        const { selectedCategory, selectedSort } = get();
        try {
          const clubs = await clubApi.getAll(selectedCategory, selectedSort);
          set({ clubs, loaded: true });
        } catch (e) {
          if (e instanceof ApiError && e.status === 0) {
            // 오프라인 → sampleData 유지
            set({ loaded: true });
          }
        }
      },

      /* ── 필터/정렬 (로컬) ─────────────────────────────── */
      getFilteredClubs: () => {
        const { clubs, selectedCategory, selectedSort } = get();
        let result = selectedCategory === '전체'
          ? [...clubs]
          : clubs.filter((c) => c.category === selectedCategory);

        if (selectedSort === '인기순') result.sort((a, b) => b.memberCount - a.memberCount);
        else if (selectedSort === '신규순') result.sort((a, b) => (b.newCount ?? 0) - (a.newCount ?? 0));
        else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return result;
      },

      getClubById: (id) => get().clubs.find((c) => c.id === id),

      /* ── 멤버 관리 ────────────────────────────────────── */
      getClubMembers: (clubId) => {
        const club = get().clubs.find(c => c.id === clubId);
        return club?.members ?? [];
      },

      setMemberRole: (clubId, userId, newRole) =>
        set(s => ({
          clubs: s.clubs.map(c =>
            c.id === clubId
              ? { ...c, members: c.members.map(m => m.userId === userId ? { ...m, role: newRole } : m) }
              : c
          )
        })),

      removeMember: (clubId, userId) =>
        set(s => ({
          clubs: s.clubs.map(c =>
            c.id === clubId
              ? { ...c, members: c.members.filter(m => m.userId !== userId), memberCount: Math.max(0, c.memberCount - 1) }
              : c
          )
        })),

      addMember: (clubId, userId) =>
        set(s => ({
          clubs: s.clubs.map(c => {
            if (c.id !== clubId) return c;
            const already = c.members?.some(m => m.userId === userId);
            if (already) return c;
            return { ...c, members: [...(c.members ?? []), { userId, role: 'member', joinedAt: new Date().toISOString() }] };
          })
        })),

      /* ── 승인 대기 클럽 추가 (클럽 개설 신청) ─────────── */
      submitClubForApproval: (club) => {
        const pending = {
          id: club.id ?? `club-${Date.now()}`,
          ...club,
          status: 'pending',
          createdAt: new Date().toISOString(),
          appliedAt: new Date().toISOString(),
        };
        set((s) => ({ pendingClubs: [pending, ...s.pendingClubs] }));
        return pending;
      },

      /* ── 관리자: 클럽 승인 ────────────────────────────── */
      approveClub: (clubId) => {
        const { pendingClubs } = get();
        const club = pendingClubs.find((c) => c.id === clubId);
        if (!club) return;
        const approved = { ...club, status: 'active' };
        set((s) => ({
          pendingClubs: s.pendingClubs.filter((c) => c.id !== clubId),
          clubs: [approved, ...s.clubs],
        }));
      },

      /* ── 관리자: 클럽 반려 ────────────────────────────── */
      rejectClub: (clubId) => {
        set((s) => ({ pendingClubs: s.pendingClubs.filter((c) => c.id !== clubId) }));
      },

      /* ── API: 클럽 생성 ───────────────────────────────── */
      addClub: async (club) => {
        try {
          const created = await clubApi.create(club);
          set((s) => ({ clubs: [created, ...s.clubs] }));
          return created;
        } catch (e) {
          if (e instanceof ApiError && e.status === 0) {
            // 오프라인 fallback
            const newClub = { id: club.id ?? `club-${Date.now()}`, ...club, createdAt: new Date().toISOString() };
            set((s) => ({ clubs: [newClub, ...s.clubs] }));
            return newClub;
          }
          throw e;
        }
      },

      /* ── API: 클럽 수정 ───────────────────────────────── */
      updateClub: async (clubId, patch) => {
        try {
          const updated = await clubApi.update(clubId, patch);
          set((s) => ({ clubs: s.clubs.map((c) => c.id === clubId ? updated : c) }));
        } catch (e) {
          if (e instanceof ApiError && e.status === 0) {
            set((s) => ({ clubs: s.clubs.map((c) => c.id === clubId ? { ...c, ...patch } : c) }));
          } else throw e;
        }
      },

      /* ── API: 클럽 삭제 ───────────────────────────────── */
      deleteClub: async (clubId) => {
        try {
          await clubApi.remove(clubId);
        } catch (e) {
          if (!(e instanceof ApiError && e.status === 0)) throw e;
        }
        set((s) => ({ clubs: s.clubs.filter((c) => c.id !== clubId) }));
      },

      /* ── 멤버 수 (낙관적) ─────────────────────────────── */
      incrementMemberCount: (clubId) =>
        set((s) => ({
          clubs: s.clubs.map((c) =>
            c.id === clubId ? { ...c, memberCount: c.memberCount + 1 } : c
          ),
        })),

      decrementMemberCount: (clubId) =>
        set((s) => ({
          clubs: s.clubs.map((c) =>
            c.id === clubId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c
          ),
        })),

      /* ── API: join / leave ────────────────────────────── */
      joinClubApi: async (clubId) => {
        try { await clubApi.join(clubId); } catch (e) {
          if (!(e instanceof ApiError && e.status === 0)) throw e;
        }
        get().incrementMemberCount(clubId);
      },

      leaveClubApi: async (clubId) => {
        try { await clubApi.leave(clubId); } catch (e) {
          if (!(e instanceof ApiError && e.status === 0)) throw e;
        }
        get().decrementMemberCount(clubId);
      },

      /* ── 일정 ─────────────────────────────────────────── */
      getMySchedules: (userId) =>
        get().schedules.filter((sch) => {
          const club = get().clubs.find((c) => c.id === sch.clubId);
          return club?.createdBy === userId;
        }),
    }),
    { name: 'linkit-clubs' }
  )
);
