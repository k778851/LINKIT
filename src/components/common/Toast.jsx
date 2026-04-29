'use client';

import styles from './Toast.module.css';

export function ToastList({ toasts, onRemove }) {
  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`} onClick={() => onRemove(t.id)}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
