'use client';

import styles from './EmptyState.module.css';

export function EmptyState({ emoji = '📭', title, description, action }) {
  return (
    <div className={styles.container}>
      <div className={styles.blob}>
        <span className={styles.emoji}>{emoji}</span>
      </div>
      {title && <p className={styles.title}>{title}</p>}
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.actionWrap}>{action}</div>}
    </div>
  );
}
