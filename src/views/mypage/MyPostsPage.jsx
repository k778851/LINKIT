'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Eye, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCommunityStore } from '../../store/communityStore';
import { Header } from '../../components/layout/Header';
import { Modal } from '../../components/common/Modal';
import { useToastContext } from '../../context/ToastContext';
import { formatRelativeTime } from '../../utils/formatDate';
import { getPostDetailPath } from '../../lib/communityRoutes';
import styles from './MyPostsPage.module.css';

const BADGE_COLORS = {
  생활정보: { color: 'var(--mint)',  bg: 'var(--mint-soft)' },
  모임:     { color: 'var(--blue)',  bg: 'var(--blue-soft)' },
  나눔:     { color: 'var(--pink)',  bg: 'var(--pink-soft)' },
  질문:     { color: '#7B61FF',      bg: '#F3F0FF' },
};

export function MyPostsPage() {
  const router = useRouter();
  const { showToast } = useToastContext();
  const user = useAuthStore((s) => s.user);
  const posts = useCommunityStore((s) => s.posts);
  const likedPosts = useCommunityStore((s) => s.likedPosts);
  const toggleLike = useCommunityStore((s) => s.toggleLike);
  const deletePost = useCommunityStore((s) => s.deletePost);
  const [pendingDelete, setPendingDelete] = useState(null); // postId | null
  const [deleting, setDeleting] = useState(false);

  const myPosts = posts
    .filter((p) => p.authorId === user?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleConfirmDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deletePost(pendingDelete);
      showToast('게시글을 삭제했어요', 'success');
    } catch {
      showToast('삭제에 실패했어요. 다시 시도해주세요.', 'error');
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
    <div className={styles.page}>
      {pendingDelete && (
        <Modal
          title="게시글 삭제"
          message="이 게시글을 삭제할까요? 되돌릴 수 없어요."
          confirmLabel="삭제"
          cancelLabel="취소"
          danger
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
      <Header
        title="작성한 게시글"
        right={
          myPosts.length > 0 && (
            <span className={styles.countBadge}>{myPosts.length}개</span>
          )
        }
      />

      {myPosts.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>✏️</p>
          <p className={styles.emptyTitle}>작성한 게시글이 없어요</p>
          <p className={styles.emptyDesc}>커뮤니티에 첫 글을 남겨보세요!</p>
          <button className={styles.writeBtn} onClick={() => router.push('/community/new')}>
            글 작성하기
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {myPosts.map((post) => {
            const isLiked = likedPosts.includes(post.id);
            const badgeStyle = BADGE_COLORS[post.category] ?? { color: 'var(--ink-3)', bg: 'var(--base-border)' };
            return (
              <div key={post.id} className={styles.card}>
                <div className={styles.cardTop} onClick={() => router.push(getPostDetailPath(post.id))}>
                  <span
                    className={styles.badge}
                    style={{ color: badgeStyle.color, background: badgeStyle.bg }}
                  >
                    {post.category}
                  </span>
                  <span className={styles.time}>{formatRelativeTime(post.createdAt)}</span>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => { e.stopPropagation(); setPendingDelete(post.id); }}
                    aria-label="게시글 삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <button className={styles.cardBody} onClick={() => router.push(getPostDetailPath(post.id))}>
                  <p className={styles.title}>{post.title}</p>
                  <p className={styles.preview}>{post.content}</p>
                  <div className={styles.stats}>
                    <span className={`${styles.stat} ${isLiked ? styles.statLiked : ''}`}>
                      <Heart size={12} fill={isLiked ? 'var(--pink)' : 'none'} />
                      {post.likeCount}
                    </span>
                    <span className={styles.stat}>
                      <MessageCircle size={12} />
                      {post.commentCount}
                    </span>
                    <span className={styles.stat}>
                      <Eye size={12} />
                      {post.viewCount}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
