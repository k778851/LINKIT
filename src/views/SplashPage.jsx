import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import styles from './SplashPage.module.css';

export function SplashPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(isAuthenticated ? '/home' : '/onboarding', { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated]);

  return (
    <div className={styles.page}>
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
