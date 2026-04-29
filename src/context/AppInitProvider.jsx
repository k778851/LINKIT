'use client';

/**
 * 앱 진입 시 한 번만 실행되는 초기화 Provider
 * - 로그인 상태라면 서버에서 최신 프로필 동기화
 * - 알림 목록 로드
 * - 클럽 목록 로드
 */

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useClubStore } from '../store/clubStore';
import { tokenStorage } from '../api/apiClient';

export function AppInitProvider({ children }) {
  const initialized       = useRef(false);
  const isAuthenticated   = useAuthStore((s) => s.isAuthenticated);
  const syncProfile       = useAuthStore((s) => s.syncProfile);
  const fetchNotifications= useNotificationStore((s) => s.fetchNotifications);
  const fetchClubs        = useClubStore((s) => s.fetchClubs);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // 백엔드와 세션 동기화
    if (isAuthenticated && tokenStorage.get()) {
      syncProfile();
      fetchNotifications();
    }

    // 클럽 목록은 항상 최신 데이터로 갱신
    fetchClubs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return children;
}
