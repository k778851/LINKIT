'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import styles from '../views/SplashPage.module.css';

export default function SplashPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(isAuthenticated ? '/home' : '/onboarding');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router, isAuthenticated]);

  return (
    <div className={`app-container ${styles.page}`}>
      <div className={styles.logoWrap}>
        <div className={styles.symbol}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
        <h1 className={styles.wordmark}>LINKIT</h1>
        <p className={styles.tagline}>우리 동네 소모임 커뮤니티</p>
      </div>
      <p className={styles.version}>v1.0.0</p>
    </div>
  );
}
