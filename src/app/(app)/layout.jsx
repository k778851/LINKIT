'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { AppLayout } from '../../components/layout/AppLayout';

/** 인증이 필요한 모든 페이지를 감싸는 레이아웃 */
export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return <AppLayout>{children}</AppLayout>;
}
