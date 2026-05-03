'use client';

import styles from './FAB.module.css';

/**
 * Floating Action Button — 스크롤해도 하단 고정 위치 유지
 */
export function FAB({ label, icon, onClick }) {
  return (
    <button className={styles.fab} onClick={onClick} aria-label={label}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {label && <span className={styles.label}>{label}</span>}
    </button>
  );
}
