'use client';

import { CATEGORY_COLORS, SAMPLE_CLUB_IMAGES } from '../../data/sampleData';
import { assetPath } from '../../lib/assetPath';
import styles from './ClubCard.module.css';

export function ClubCard({ club, onClick }) {
  const colors = CATEGORY_COLORS[club.category] ?? ['#8EC6FF', '#0088FF'];
  const gradient = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
  const coverImage = club.coverImage ?? club.posterImages?.[0] ?? SAMPLE_CLUB_IMAGES[club.id];
  const coverSrc = coverImage?.startsWith('/') ? assetPath(coverImage) : coverImage;
  const posterStyle = coverSrc
    ? { backgroundImage: `url("${coverSrc}")` }
    : { background: gradient };

  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.poster} style={posterStyle}>
        {club.isPrivate && (
          <span className={styles.badgePrivate}>비공개</span>
        )}
      </div>
      <div className={styles.info}>
        <p className={styles.category}>{club.category}</p>
        <p className={`${styles.name} truncate-1`}>{club.name}</p>
        {club.description && (
          <p className={styles.desc}>
            {club.description.length > 15
              ? club.description.slice(0, 15) + '…'
              : club.description}
          </p>
        )}
        <p className={styles.meta}>{club.memberCount.toLocaleString()}명</p>
      </div>
    </button>
  );
}
