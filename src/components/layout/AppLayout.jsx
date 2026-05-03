'use client';

import { BottomTabBar } from './BottomTabBar';
import { AnimatedPage } from './AnimatedPage';
import { useTheme } from '../../hooks/useTheme';
import { useSseNotifications } from '../../hooks/useSseNotifications';
import { useInitialLoad } from '../../hooks/useInitialLoad';
import styles from './AppLayout.module.css';

export function AppLayout({ children }) {
  useTheme();
  useSseNotifications();
  useInitialLoad();

  return (
    <div className={`app-container ${styles.layout}`}>
      <main className={styles.main}>
        <AnimatedPage>{children}</AnimatedPage>
      </main>
      <BottomTabBar />
    </div>
  );
}
