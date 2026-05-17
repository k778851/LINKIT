'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useClubStore } from '../store/clubStore';
import { useCommunityStore } from '../store/communityStore';
import { tokenStorage } from '../api/apiClient';
import { getAdminRegion, isSuperAdmin, isJipa } from '../utils/permissions';

export function AppInitProvider({ children }) {
  const initialized = useRef(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const syncProfile = useAuthStore((s) => s.syncProfile);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const fetchClubs = useClubStore((s) => s.fetchClubs);
  const fetchPosts = useCommunityStore((s) => s.fetchPosts);
  const selectedRegion = useClubStore((s) => s.selectedRegion);
  const setRegion = useClubStore((s) => s.setRegion);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (isAuthenticated && tokenStorage.get()) {
      syncProfile();
      fetchNotifications();
    }

    fetchClubs();
    fetchPosts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 지역 자동 고정 — 역할별 처리
  useEffect(() => {
    if (!user) return;
    // 전체관리자·지파: 지역 제한 없음, 항상 '전체' 보기
    if (isSuperAdmin(user) || isJipa(user)) {
      if (selectedRegion !== '전체') setRegion('전체');
      return;
    }
    // 지역관리자: role에서 지역 결정 / 일반 유저: serviceRegion 필드 사용
    const lockedRegion = getAdminRegion(user) ?? user.serviceRegion ?? null;
    if (lockedRegion && selectedRegion !== lockedRegion) {
      setRegion(lockedRegion);
    }
  }, [user, selectedRegion, setRegion]);

  return children;
}
