'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useClubStore } from '../store/clubStore';
import { tokenStorage } from '../api/apiClient';

export function AppInitProvider({ children }) {
  const initialized = useRef(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const syncProfile = useAuthStore((s) => s.syncProfile);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const fetchClubs = useClubStore((s) => s.fetchClubs);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (isAuthenticated && tokenStorage.get()) {
      syncProfile();
      fetchNotifications();
    }

    fetchClubs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return children;
}
