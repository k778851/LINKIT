'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '../store/authStore';
import { tokenStorage } from '../api/apiClient';
import { assetPath } from '../lib/assetPath';
import styles from '../views/SplashPage.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

async function isBackendUp() {
  try {
    const res = await fetch(`${API_URL}/api/clubs`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok || res.status === 401;
  } catch {
    return false;
  }
}

export default function SplashPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const hasToken = !!tokenStorage.get();

      if (!isAuthenticated) {
        // 미인증 → 온보딩(로그인)
        router.replace('/onboarding');
        return;
      }

      if (hasToken) {
        // JWT 있음 = 실제 로그인 → 홈으로
        router.replace('/home');
        return;
      }

      // JWT 없음 = 데모 로그인 → 백엔드 확인
      const backendUp = await isBackendUp();
      if (backendUp) {
        // 백엔드 켜져있음 → 로그인 화면으로 유도
        router.replace('/onboarding');
      } else {
        // 백엔드 없음 → 데모 모드로 홈
        router.replace('/home');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [router, isAuthenticated]);

  return (
    <div className={`app-container ${styles.page}`}>
      <div className={styles.logoWrap}>
        <Image
          src={assetPath('/logo-sig-v-white.png')}
          alt="LINKIT"
          width={180}
          height={216}
          priority
          className={styles.logoImg}
        />
        <p className={styles.tagline}>우리 동네 소모임 커뮤니티</p>
      </div>
      <p className={styles.version}>v1.0.0</p>
    </div>
  );
}
