'use client';

import styles from './SkeletonList.module.css';

/** 게시글 카드 스켈레톤 */
export function PostCardSkeleton() {
  return (
    <div className={styles.postCard}>
      <div className={styles.postMain}>
        <div className={styles.row}>
          <div className={`${styles.bone} ${styles.badge}`} />
          <div className={`${styles.bone} ${styles.author}`} />
        </div>
        <div className={`${styles.bone} ${styles.title}`} />
        <div className={`${styles.bone} ${styles.line}`} />
        <div className={styles.row} style={{ gap: 8, marginTop: 4 }}>
          <div className={`${styles.bone} ${styles.meta}`} />
          <div className={`${styles.bone} ${styles.meta}`} />
        </div>
      </div>
      <div className={`${styles.bone} ${styles.thumb}`} />
    </div>
  );
}

/** 클럽 카드 스켈레톤 (그리드용) */
export function ClubCardSkeleton() {
  return (
    <div className={styles.clubCard}>
      <div className={`${styles.bone} ${styles.clubPoster}`} />
      <div style={{ padding: '8px 4px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className={`${styles.bone} ${styles.clubCat}`} />
        <div className={`${styles.bone} ${styles.clubName}`} />
        <div className={`${styles.bone} ${styles.clubMeta}`} />
      </div>
    </div>
  );
}

/** 멤버/리스트 행 스켈레톤 */
export function RowSkeleton() {
  return (
    <div className={styles.row} style={{ padding: '12px 0', gap: 12, borderBottom: '1px solid var(--base-border)' }}>
      <div className={`${styles.bone} ${styles.avatar}`} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className={`${styles.bone} ${styles.rowTitle}`} />
        <div className={`${styles.bone} ${styles.rowMeta}`} />
      </div>
    </div>
  );
}
