'use client';

import { useRouter } from 'next/navigation';
import styles from './not-found.module.css';

export default function NotFound() {
  const router = useRouter();
  return (
    <div className={`app-container ${styles.page}`}>
      <div className={styles.inner}>
        <span className={styles.emoji}>🔍</span>
        <h1 className={styles.title}>페이지를 찾을 수 없어요</h1>
        <p className={styles.desc}>링크가 잘못되었거나 삭제된 페이지예요.</p>
        <button className={styles.homeBtn} onClick={() => router.replace('/home')}>
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
