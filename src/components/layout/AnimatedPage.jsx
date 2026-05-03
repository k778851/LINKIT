'use client';

import { usePathname } from 'next/navigation';
import styles from './AnimatedPage.module.css';

/**
 * 페이지 경로가 바뀔 때마다 슬라이드업 애니메이션 재실행
 */
export function AnimatedPage({ children }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className={styles.page}>
      {children}
    </div>
  );
}
