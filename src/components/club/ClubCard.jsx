'use client';

import { CLUB_EMOJIS } from '../../data/sampleData';
import styles from './ClubCard.module.css';

export function ClubCard({ club, onClick }) {
  const colors = CLUB_EMOJIS[club.emoji] ?? ['#8EC6FF', '#0088FF'];
  const gradient = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
  const showNewBadge = (club.newCount ?? 0) > 5;

  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.poster} style={{ background: gradient }}>
        <span className={styles.emoji}>{club.emoji}</span>
        {club.isPrivate && (
          <span className={styles.badgePrivate}>비공개</span>
        )}
        {showNewBadge && (
          <span className={styles.badgeNew}>+{club.newCount} 신규</span>
        )}
      </div>
      <div className={styles.info}>
        <p className={styles.category}>{club.category}</p>
        <p className={`${styles.name} truncate-1`}>{club.name}</p>
        <p className={styles.meta}>{club.memberCount.toLocaleString()}명</p>
      </div>
    </button>
  );
}
