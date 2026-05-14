import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sampleClubs, sampleSchedules } from '../data/sampleData';
import { matchesRegion } from '../data/regions';
import { clubApi } from '../api/clubApi';
import { scheduleApi } from '../api/scheduleApi';
import { ApiError } from '../api/apiClient';

const shouldFallback = (e) =>
  e instanceof ApiError && (e.status === 0 || e.status === 401 || e.status === 403);

export const useClubStore = create(
  persist(
    (set, get) => ({
      clubs: sampleClubs,
      pendingClubs: [],
      schedules: sampleSchedules,
      appliedScheduleIds: [],
      selectedCategory: '전체',
      selectedSort: '최신순',
      selectedRegion: '전체',
      loaded: false,

      setCategory: (category) => set({ selectedCategory: category }),
      setSort: (sort) => set({ selectedSort: sort }),
      setRegion: (region) => set({ selectedRegion: region }),

      fetchClubs: async () => {
        const { selectedCategory, selectedSort } = get();
        try {
          const clubs = await clubApi.getAll(selectedCategory, selectedSort);
          if (clubs && clubs.length > 0) set({ clubs, loaded: true });
          else set({ loaded: true });
        } catch (e) {
          if (shouldFallback(e)) set({ loaded: true });
          else throw e;
        }
      },

      getFilteredClubs: () => {
        const { clubs, selectedCategory, selectedSort, selectedRegion } = get();
        let result = selectedCategory === '전체'
          ? [...clubs]
          : clubs.filter((club) => club.category === selectedCategory);

        result = result.filter((club) => matchesRegion(club, selectedRegion));

        if (selectedSort === '인기순') {
          result.sort((a, b) => b.memberCount - a.memberCount);
        } else if (selectedSort === '신규순') {
          result.sort((a, b) => (b.newCount ?? 0) - (a.newCount ?? 0));
        } else {
          result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return result;
      },

      getClubById: (id) => get().clubs.find((club) => club.id === id),

      getClubMembers: (clubId) => {
        const club = get().clubs.find((item) => item.id === clubId);
        return club?.members ?? [];
      },

      setMemberRole: (clubId, userId, newRole) =>
        set((state) => ({
          clubs: state.clubs.map((club) =>
            club.id === clubId
              ? {
                  ...club,
                  members: (club.members ?? []).map((member) =>
                    member.userId === userId ? { ...member, role: newRole } : member
                  ),
                }
              : club
          ),
        })),

      removeMember: (clubId, userId) =>
        set((state) => ({
          clubs: state.clubs.map((club) =>
            club.id === clubId
              ? {
                  ...club,
                  members: (club.members ?? []).filter((member) => member.userId !== userId),
                  memberCount: Math.max(0, club.memberCount - 1),
                }
              : club
          ),
        })),

      addMember: (clubId, userId) =>
        set((state) => ({
          clubs: state.clubs.map((club) => {
            if (club.id !== clubId) return club;
            if (club.members?.some((member) => member.userId === userId)) return club;
            return {
              ...club,
              members: [...(club.members ?? []), { userId, role: 'member', joinedAt: new Date().toISOString() }],
            };
          }),
        })),

      submitClubForApproval: (club) => {
        const pending = {
          id: club.id ?? `club-${Date.now()}`,
          ...club,
          status: 'pending',
          createdAt: new Date().toISOString(),
          appliedAt: new Date().toISOString(),
          members: [{ userId: club.createdBy, role: 'owner', joinedAt: new Date().toISOString() }],
        };
        set((state) => ({
          pendingClubs: [pending, ...state.pendingClubs],
          clubs: [pending, ...state.clubs],
        }));
        return pending;
      },

      approveClub: (clubId) => {
        const club = get().pendingClubs.find((item) => item.id === clubId);
        if (!club) return;
        const approved = { ...club, status: 'active' };
        set((state) => ({
          pendingClubs: state.pendingClubs.filter((item) => item.id !== clubId),
          clubs: [approved, ...state.clubs.filter((item) => item.id !== clubId)],
        }));
      },

      rejectClub: (clubId) => {
        set((state) => ({ pendingClubs: state.pendingClubs.filter((club) => club.id !== clubId) }));
      },

      addClub: async (club) => {
        try {
          const created = await clubApi.create(club);
          set((state) => ({ clubs: [created, ...state.clubs] }));
          return created;
        } catch (e) {
          if (!shouldFallback(e)) throw e;
          const newClub = { id: club.id ?? `club-${Date.now()}`, ...club, createdAt: new Date().toISOString() };
          set((state) => ({ clubs: [newClub, ...state.clubs] }));
          return newClub;
        }
      },

      updateClub: async (clubId, patch) => {
        try {
          const updated = await clubApi.update(clubId, patch);
          set((state) => ({ clubs: state.clubs.map((club) => club.id === clubId ? updated : club) }));
        } catch (e) {
          if (!shouldFallback(e)) throw e;
          set((state) => ({ clubs: state.clubs.map((club) => club.id === clubId ? { ...club, ...patch } : club) }));
        }
      },

      deleteClub: async (clubId) => {
        try {
          await clubApi.remove(clubId);
        } catch (e) {
          if (!shouldFallback(e)) throw e;
        }
        set((state) => ({ clubs: state.clubs.filter((club) => club.id !== clubId) }));
      },

      incrementMemberCount: (clubId) =>
        set((state) => ({
          clubs: state.clubs.map((club) => club.id === clubId ? { ...club, memberCount: club.memberCount + 1 } : club),
        })),

      decrementMemberCount: (clubId) =>
        set((state) => ({
          clubs: state.clubs.map((club) => club.id === clubId ? { ...club, memberCount: Math.max(0, club.memberCount - 1) } : club),
        })),

      joinClubApi: async (clubId) => {
        try {
          await clubApi.join(clubId);
        } catch (e) {
          if (!shouldFallback(e)) throw e;
        }
        get().incrementMemberCount(clubId);
      },

      leaveClubApi: async (clubId) => {
        try {
          await clubApi.leave(clubId);
        } catch (e) {
          if (!shouldFallback(e)) throw e;
        }
        get().decrementMemberCount(clubId);
      },

      applySchedule: async (scheduleId) => {
        if (get().appliedScheduleIds.includes(scheduleId)) return;
        set((state) => ({ appliedScheduleIds: [...state.appliedScheduleIds, scheduleId] }));
        try {
          await scheduleApi.apply(scheduleId);
        } catch (e) {
          if (!shouldFallback(e)) {
            set((state) => ({ appliedScheduleIds: state.appliedScheduleIds.filter((id) => id !== scheduleId) }));
            throw e;
          }
        }
      },

      cancelSchedule: async (scheduleId) => {
        if (!get().appliedScheduleIds.includes(scheduleId)) return;
        set((state) => ({ appliedScheduleIds: state.appliedScheduleIds.filter((id) => id !== scheduleId) }));
        try {
          await scheduleApi.cancel(scheduleId);
        } catch (e) {
          if (!shouldFallback(e)) {
            set((state) => ({ appliedScheduleIds: [...state.appliedScheduleIds, scheduleId] }));
            throw e;
          }
        }
      },

      getMySchedules: (userId) =>
        get().schedules.filter((schedule) => {
          const club = get().clubs.find((item) => item.id === schedule.clubId);
          return club?.createdBy === userId;
        }),
    }),
    {
      name: 'linkit-clubs',
      merge: (persisted, initial) => ({
        ...initial,
        ...persisted,
        selectedCategory: persisted?.selectedCategory && ['전체', '운동', '음식', '아트', '스터디', '음악', '기타'].includes(persisted.selectedCategory)
          ? persisted.selectedCategory
          : initial.selectedCategory,
        selectedSort: persisted?.selectedSort && ['최신순', '인기순', '신규순'].includes(persisted.selectedSort)
          ? persisted.selectedSort
          : initial.selectedSort,
        selectedRegion: persisted?.selectedRegion && ['전체', '북구', '광산', '본부'].includes(persisted.selectedRegion)
          ? persisted.selectedRegion
          : initial.selectedRegion,
        clubs: (() => {
          const sampleIds = new Set(initial.clubs.map((club) => club.id));
          const userAdded = (persisted?.clubs ?? []).filter((club) => !sampleIds.has(club.id));
          return [...initial.clubs, ...userAdded];
        })(),
        schedules: (() => {
          const sampleIds = new Set(initial.schedules.map((schedule) => schedule.id));
          const userAdded = (persisted?.schedules ?? []).filter((schedule) => !sampleIds.has(schedule.id));
          return [...initial.schedules, ...userAdded];
        })(),
      }),
    }
  )
);
