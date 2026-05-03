'use client';

import { Eye, Heart, MessageCircle, MapPin } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatDate';
import styles from './PostCard.module.css';

/* Badge class by category — matches design spec */
function badgeClass(category) {
  switch (category) {
    case '생활정보': return styles.badgeMint;
    case '모임':     return styles.badgeBlue;
    case '나눔':     return styles.badgePink;
    default:         return styles.badgeGray;
  }
}

export function PostCard({ post, onClick }) {
  const dateStr = post.createdAt
    ? new Date(post.createdAt).toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
      }).replace(/\. /g, '.').replace('.', '')
    : post.time ?? '';

  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.row}>
        <div className={styles.main}>
          <div className={styles.top}>
            <span className={`${styles.badge} ${badgeClass(post.category)}`}>{post.category}</span>
            <span className={styles.author}>{post.authorEmoji} {post.authorNickname}</span>
          </div>
          <p className={`${styles.title} truncate-1`}>{post.title}</p>
          <p className={`${styles.preview} truncate-1`}>{post.content}</p>
          <div className={styles.footer}>
            {post.location && (
              <span className={styles.meta}><MapPin size={11} />{post.location}</span>
            )}
            <span className={styles.meta}>{dateStr}</span>
            <span className={styles.meta}><Eye size={11} />{post.viewCount}</span>
            <span className={styles.meta}><MessageCircle size={11} />{post.commentCount}</span>
          </div>
        </div>
        {post.image && (
          <div className={styles.thumb}>
            <img src={post.image} alt="" className={styles.thumbImg} />
          </div>
        )}
      </div>
    </button>
  );
}
