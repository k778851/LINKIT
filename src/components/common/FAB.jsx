'use client';

import styles from './FAB.module.css';

/**
 * Floating Action Button — pink, bottom-right
 * @param {string} label  - visible text label
 * @param {React.ReactNode} icon - optional icon (left of label)
 * @param {function} onClick
 */
export function FAB({ label, icon, onClick }) {
  return (
    <button className={styles.fab} onClick={onClick} aria-label={label}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {label && <span className={styles.label}>{label}</span>}
    </button>
  );
}
