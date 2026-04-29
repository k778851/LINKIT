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
  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.main}>
        <div className={styles.top}>
          <span className={`${styles.badge} ${badgeClass(post.category)}`}>{post.category}</span>
          <span className={styles.author}>{post.authorEmoji} {post.authorNickname}</span>
          {post.time && <span className={styles.time}>{post.time}</span>}
        </div>
        <p className={`${styles.title} truncate-1`}>{post.title}</p>
        <p className={`${styles.preview} truncate-2`}>{post.content}</p>
        <div className={styles.footer}>
          {post.location && (
            <span className={styles.meta}><MapPin size={11} />{post.location}</span>
          )}
          {!post.time && <span className={styles.meta}>{formatRelativeTime(post.createdAt)}</span>}
          <span className={styles.meta}><Eye size={11} />{post.viewCount}</span>
          <span className={`${styles.meta} ${post.liked ? styles.likedMeta : ''}`}>
            <Heart size={11} fill={post.liked ? 'var(--pink)' : 'none'} />{post.likeCount}
          </span>
          <span className={styles.meta}><MessageCircle size={11} />{post.commentCount}</span>
        </div>
      </div>
    </button>
  );
}
