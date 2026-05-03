'use client';

import styles from './FAB.module.css';

/**
 * Floating Action Button — pink, bottom-right
 * @param {string} label  - visible text label
 * @param {React.ReactNode} icon - optional icon (left of label)
 * @param {function} onClick
 */
/**
 * pinned=true → 탭바 바로 위에 전폭 고정 버튼
 */
export function FAB({ label, icon, onClick, pinned = false }) {
  return (
    <div className={pinned ? styles.pinnedWrap : undefined}>
      <button
        className={pinned ? styles.pinnedBtn : styles.fab}
        onClick={onClick}
        aria-label={label}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        {label && <span className={styles.label}>{label}</span>}
      </button>
    </div>
  );
}
