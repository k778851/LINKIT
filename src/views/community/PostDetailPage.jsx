'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Heart, Share2, Eye, MessageCircle, Send, Trash2, Pencil } from 'lucide-react';
import { useCommunityStore } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';
import { getPostEditPath, getPostLookupId } from '../../lib/communityRoutes';
import { Header } from '../../components/layout/Header';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { useToastContext } from '../../context/ToastContext';
import { formatDate, formatRelativeTime } from '../../utils/formatDate';
import styles from './PostDetailPage.module.css';

/* Badge class by category */
function badgeClass(cat) {
  switch (cat) {
    case '생활정보': return styles.badgeMint;
    case '모임':     return styles.badgeBlue;
    case '나눔':     return styles.badgePink;
    default:         return styles.badgeGray;
  }
}

export function PostDetailPage({ postId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lookupPostId = getPostLookupId(postId, searchParams.get('postId'));
  const post = useCommunityStore((s) => s.posts.find((p) => p.id === lookupPostId));
  const allComments = useCommunityStore((s) => s.comments);
  const comments = useMemo(
    () => allComments.filter((c) => c.postId === lookupPostId),
    [allComments, lookupPostId]
  );
  const { toggleLike, likedPosts, incrementView, addComment, deletePost } = useCommunityStore();
  const user = useAuthStore((s) => s.user);
  const [commentText, setCommentText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { showToast } = useToastContext();
  const isLiked = likedPosts.includes(lookupPostId);
  const canSend = commentText.trim().length > 0;
  const isAuthor = post?.authorId === user?.id;

  useEffect(() => { if (post) incrementView(lookupPostId); }, [lookupPostId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!post) return <EmptyState emoji="😢" title="게시글을 찾을 수 없어요" />;

  const handleComment = () => {
    if (!canSend) return;
    addComment({ postId: lookupPostId, content: commentText.trim(), authorId: user?.id, authorNickname: user?.nickname });
    setCommentText('');
    showToast('댓글을 등록했어요', 'success');
  };

  const handleDelete = async () => {
    try {
      await deletePost(lookupPostId);
      showToast('게시글을 삭제했어요', 'success');
      router.back();
    } catch {
      showToast('삭제에 실패했어요. 다시 시도해주세요.', 'error');
      setShowDeleteModal(false);
    }
  };

  return (
    <div className={styles.page} style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <Header
        title=""
        right={
          isAuthor && (
            <div className={styles.headerBtns}>
              <button className={styles.headerIconBtn} onClick={() => router.push(getPostEditPath(lookupPostId))} aria-label="게시글 수정">
                <Pencil size={17} color="var(--ink-3)" />
              </button>
              <button className={styles.headerIconBtn} onClick={() => setShowDeleteModal(true)} aria-label="게시글 삭제">
                <Trash2 size={17} color="var(--ink-3)" />
              </button>
            </div>
          )
        }
      />
      {showDeleteModal && (
        <Modal
          title="게시글 삭제"
          message="이 게시글을 삭제할까요? 되돌릴 수 없어요."
          confirmLabel="삭제"
          cancelLabel="취소"
          danger
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '0 20px 12px', borderBottom: '1px solid var(--base-border)' }}>
          {/* 카테고리 & 제목 */}
          <div className={styles.topMeta}>
            <span className={`${styles.badge} ${badgeClass(post.category)}`}>{post.category}</span>
          </div>
          <h1 className={styles.title}>{post.title}</h1>

          <button
            className={styles.authorRow}
            onClick={() => post.authorId && router.push(`/users?userId=${post.authorId}`)}
          >
            <span className={styles.authorEmoji}>{post.authorNickname?.[0]?.toUpperCase() ?? '?'}</span>
            <div>
              <p className={styles.authorName}>{post.authorNickname}</p>
              <div className={styles.authorMeta}>
                <span>{formatDate(post.createdAt)}</span>
                <Eye size={11} /><span>{post.viewCount}</span>
              </div>
            </div>
          </button>

          <p className={styles.content}>{post.content}</p>

          {/* 액션 */}
          <div className={styles.actions}>
            <button className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`} onClick={() => { toggleLike(lookupPostId); showToast(isLiked ? '좋아요를 취소했어요' : '좋아요를 눌렀어요 ❤️', 'success'); }}>
              <Heart size={18} fill={isLiked ? 'var(--pink)' : 'none'} />
              <span>{post.likeCount}</span>
            </button>
            <button
              className={styles.actionBtn}
              onClick={async () => {
                const url = window.location.href;
                if (navigator.share) {
                  await navigator.share({ title: post.title, text: post.content, url });
                } else {
                  await navigator.clipboard.writeText(url);
                  showToast('링크가 복사됐어요 🔗', 'success');
                }
              }}
            >
              <Share2 size={18} />
              <span>공유</span>
            </button>
          </div>
        </div>

        {/* 댓글 목록 */}
        <div className={styles.commentSection} style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
          <p className={styles.commentHeader}><MessageCircle size={14} /> 댓글 {comments.length}</p>
          {comments.length === 0
            ? <p className={styles.noComment}>첫 댓글을 남겨보세요!</p>
            : comments.map((c) => (
                <div key={c.id} className={styles.comment}>
                  <span className={styles.commentEmoji}>{c.authorNickname?.[0]?.toUpperCase() ?? '?'}</span>
                  <div className={styles.commentBody}>
                    <div className={styles.commentTop}>
                      <span className={styles.commentName}>{c.authorNickname}</span>
                      <span className={styles.commentTime}>{formatRelativeTime(c.createdAt)}</span>
                    </div>
                    <p className={styles.commentText}>{c.content}</p>
                  </div>
                </div>
              ))
          }
          <div style={{ height: 16 }} />
        </div>
      </div>

      {/* 댓글 입력창 */}
      <div className={styles.inputBar}>
        <input
          className={styles.commentInput}
          placeholder="댓글을 입력하세요..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleComment()}
        />
        {/* Pink when has text, gray border when empty */}
        <button
          className={`${styles.sendBtn} ${canSend ? styles.sendActive : ''}`}
          onClick={handleComment}
          disabled={!canSend}
          aria-label="댓글 등록"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
