'use client';

import { BottomTabBar } from './BottomTabBar';
import { useTheme } from '../../hooks/useTheme';
import styles from './AppLayout.module.css';

export function AppLayout({ children }) {
  useTheme();

  return (
    <div className={`app-container ${styles.layout}`}>
      <main className={styles.main}>
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
