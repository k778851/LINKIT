'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useClubStore } from '../store/clubStore';
import { useCommunityStore } from '../store/communityStore';
import { tokenStorage } from '../api/apiClient';
import { isSuperAdmin } from '../utils/permissions';

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

  // 전체관리자가 아닐 때는 지역 필터를 '전체'로 강제 (UI 미노출 + 의도치 않은 필터링 방지)
  useEffect(() => {
    if (!isSuperAdmin(user) && selectedRegion !== '전체') {
      setRegion('전체');
    }
  }, [user, selectedRegion, setRegion]);

  return children;
}
