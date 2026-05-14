'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useClubStore } from '../store/clubStore';
import { useCommunityStore } from '../store/communityStore';
import { useNotificationStore } from '../store/notificationStore';
import { tokenStorage } from '../api/apiClient';

export function useInitialLoad() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const syncProfile = useAuthStore((s) => s.syncProfile);
  const fetchClubs = useClubStore((s) => s.fetchClubs);
  const fetchPosts = useCommunityStore((s) => s.fetchPosts);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    fetchClubs().catch(() => {});
    fetchPosts().catch(() => {});

    if (isAuthenticated && tokenStorage.get()) {
      syncProfile().catch(() => {});
      fetchNotifications().catch(() => {});
    }
  }, [isAuthenticated, fetchClubs, fetchNotifications, fetchPosts, syncProfile]);
}
