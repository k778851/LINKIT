'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { AppLayout } from '../../components/layout/AppLayout';

/** 인증이 필요한 모든 페이지를 감싸는 레이아웃 */
export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    setHydrated(useAuthStore.persist.hasHydrated());
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace('/onboarding');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) return null;

  return <AppLayout>{children}</AppLayout>;
}
