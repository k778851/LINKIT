'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useClubStore } from '../store/clubStore';
import { useCommunityStore } from '../store/communityStore';
import { useNotificationStore } from '../store/notificationStore';
import { tokenStorage } from '../api/apiClient';

/**
 * 앱 최초 진입 시 서버에서 핵심 데이터를 한 번만 로드
 * - 인증 상태가 true일 때만 실행
 */
export function useInitialLoad() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const syncProfile       = useAuthStore((s) => s.syncProfile);
  const fetchClubs        = useClubStore((s) => s.fetchClubs);
  const fetchPosts        = useCommunityStore((s) => s.fetchPosts);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const ranRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || ranRef.current) return;
    ranRef.current = true;

    // 병렬 로드 — 실패해도 서로 영향 없도록
    syncProfile().catch(() => {});
    if (!tokenStorage.get()) return;

    fetchClubs().catch(() => {});
    fetchPosts().catch(() => {});
    fetchNotifications().catch(() => {});
  }, [isAuthenticated]);
}
