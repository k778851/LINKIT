'use client';

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Eye, Send, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useCommunityStore } from '../../../store/communityStore';
import { useAuthStore } from '../../../store/authStore';
import { useToastContext } from '../../../context/ToastContext';
import { formatRelativeTime } from '../../../utils/formatDate';
import styles from './ClubBoardTab.module.css';

const BOARD_CATEGORIES = ['전체', '공지', '자유', '질문'];

const CATEGORY_COLORS = {
  공지: { color: 'var(--pink)',  bg: 'var(--pink-soft)' },
  자유: { color: 'var(--blue)',  bg: 'var(--blue-soft)' },
  질문: { color: 'var(--mint)',  bg: 'var(--mint-soft)' },
};

export function ClubBoardTab({ clubId }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToastContext();
  const clubPosts          = useCommunityStore((s) => s.clubPosts);
  const likedClubPosts     = useCommunityStore((s) => s.likedClubPosts);
  const addClubPost        = useCommunityStore((s) => s.addClubPost);
  const toggleClubPostLike = useCommunityStore((s) => s.toggleClubPostLike);
  const addClubComment     = useCommunityStore((s) => s.addClubComment);
  const allComments        = useCommunityStore((s) => s.comments);

  const [filter, setFilter] = useState('전체');
  const [showWrite, setShowWrite] = useState(false);
  const [writeForm, setWriteForm] = useState({ category: '자유', title: '', content: '' });
  const [writeErrors, setWriteErrors] = useState({});
  const [expandedPost, setExpandedPost] = useState(null); // postId | null
  const [commentTexts, setCommentTexts] = useState({}); // { [postId]: string }

  const posts = clubPosts
    .filter((p) => p.clubId === clubId)
    .filter((p) => filter === '전체' || p.category === filter);

  const setField = (k, v) => setWriteForm((f) => ({ ...f, [k]: v }));

  const getPostComments = (postId) => allComments.filter((c) => c.postId === postId);

  const handleCommentSubmit = (postId) => {
    const text = (commentTexts[postId] ?? '').trim();
    if (!text) return;
    addClubComment({ postId, content: text, authorId: user?.id, authorNickname: user?.nickname });
    setCommentTexts((prev) => ({ ...prev, [postId]: '' }));
    showToast('댓글을 등록했어요', 'success');
  };

  const validateWrite = () => {
    const e = {};
    if (!writeForm.title.trim()) e.title = '제목을 입력하세요.';
    if (!writeForm.content.trim()) e.content = '내용을 입력하세요.';
    setWriteErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePost = () => {
    if (!validateWrite()) return;
    addClubPost({
      clubId,
      ...writeForm,
      authorId: user?.id,
      authorNickname: user?.nickname ?? '익명',
    });
    showToast('게시글을 등록했어요 🎉', 'success');
    setWriteForm({ category: '자유', title: '', content: '' });
    setWriteErrors({});
    setShowWrite(false);
  };

  return (
    <div className={styles.tab}>
      {/* 카테고리 필터 */}
      <div className={styles.filterRow}>
        {BOARD_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`${styles.filterChip} ${filter === cat ? styles.filterActive : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
        <button className={styles.writeBtn} onClick={() => setShowWrite(true)}>
          ✏️ 글쓰기
        </button>
      </div>

      {/* 게시글 목록 */}
      {posts.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>📝</p>
          <p className={styles.emptyTitle}>아직 게시글이 없어요</p>
          <p className={styles.emptyDesc}>첫 번째 글을 남겨보세요!</p>
          <button className={styles.emptyWriteBtn} onClick={() => setShowWrite(true)}>
            글 작성하기
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {posts.map((post) => {
            const isLiked = likedClubPosts.includes(post.id);
            const catStyle = CATEGORY_COLORS[post.category] ?? { color: 'var(--ink-3)', bg: 'var(--base-border)' };
            return (
              <div key={post.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span
                    className={styles.catBadge}
                    style={{ color: catStyle.color, background: catStyle.bg }}
                  >
                    {post.category}
                  </span>
                </div>
                <p className={styles.cardTitle}>{post.title}</p>
                <p className={styles.cardContent}>{post.content}</p>
                <div className={styles.cardMeta}>
                  <span className={styles.metaAuthor}>
                    {post.authorNickname}
                  </span>
                  <span className={styles.metaTime}>
                    {formatRelativeTime(post.createdAt)}
                  </span>
                  <div className={styles.metaStats}>
                    <button
                      className={`${styles.statBtn} ${isLiked ? styles.statLiked : ''}`}
                      onClick={() => {
                        toggleClubPostLike(post.id);
                        showToast(isLiked ? '좋아요를 취소했어요' : '좋아요를 눌렀어요 ❤️', 'success');
                      }}
                    >
                      <Heart size={13} fill={isLiked ? 'var(--pink)' : 'none'} />
                      <span>{post.likeCount}</span>
                    </button>
                    <button
                      className={`${styles.statBtn} ${expandedPost === post.id ? styles.statActive : ''}`}
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    >
                      {expandedPost === post.id
                        ? <ChevronUp size={13} />
                        : <ChevronDown size={13} />}
                      <MessageCircle size={13} />
                      <span>{getPostComments(post.id).length}</span>
                    </button>
                    <span className={styles.statItem}>
                      <Eye size={13} />
                      <span>{post.viewCount}</span>
                    </span>
                  </div>
                </div>

                {/* 댓글 패널 */}
                {expandedPost === post.id && (
                  <div className={styles.commentPanel}>
                    {getPostComments(post.id).length === 0 ? (
                      <p className={styles.noComment}>첫 댓글을 남겨보세요!</p>
                    ) : (
                      getPostComments(post.id).map((c) => (
                        <div key={c.id} className={styles.comment}>
                          <span className={styles.commentEmoji}>{c.authorNickname?.[0]?.toUpperCase() ?? '?'}</span>
                          <div className={styles.commentBody}>
                            <span className={styles.commentName}>{c.authorNickname}</span>
                            <span className={styles.commentTime}>{formatRelativeTime(c.createdAt)}</span>
                            <p className={styles.commentText}>{c.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                    {/* 댓글 입력 */}
                    <div className={styles.commentInput}>
                      <input
                        className={styles.commentInputField}
                        placeholder="댓글을 입력하세요..."
                        value={commentTexts[post.id] ?? ''}
                        onChange={(e) => setCommentTexts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                      />
                      <button
                        className={`${styles.commentSendBtn} ${(commentTexts[post.id] ?? '').trim() ? styles.commentSendActive : ''}`}
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={!(commentTexts[post.id] ?? '').trim()}
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 글쓰기 바텀시트 */}
      {showWrite && (
        <div className={styles.sheetOverlay} onClick={() => setShowWrite(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHeader}>
              <p className={styles.sheetTitle}>게시글 작성</p>
              <button className={styles.sheetClose} onClick={() => setShowWrite(false)}>
                <X size={20} />
              </button>
            </div>

            {/* 카테고리 */}
            <div className={styles.sheetSection}>
              <div className={styles.sheetChipRow}>
                {['공지', '자유', '질문'].map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.sheetChip} ${writeForm.category === cat ? styles.sheetChipActive : ''}`}
                    onClick={() => setField('category', cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 */}
            <div className={styles.sheetSection}>
              <input
                className={`${styles.sheetInput} ${writeErrors.title ? styles.sheetInputErr : ''}`}
                placeholder="제목을 입력하세요"
                maxLength={50}
                value={writeForm.title}
                onChange={(e) => setField('title', e.target.value)}
              />
              {writeErrors.title && <p className={styles.sheetErrMsg}>{writeErrors.title}</p>}
            </div>

            {/* 내용 */}
            <div className={styles.sheetSection}>
              <textarea
                className={`${styles.sheetTextarea} ${writeErrors.content ? styles.sheetInputErr : ''}`}
                placeholder="내용을 입력하세요"
                maxLength={500}
                rows={5}
                value={writeForm.content}
                onChange={(e) => setField('content', e.target.value)}
              />
              {writeErrors.content && <p className={styles.sheetErrMsg}>{writeErrors.content}</p>}
              <p className={styles.sheetCounter}>{writeForm.content.length}/500</p>
            </div>

            <button
              className={`${styles.sheetSubmit} ${(writeForm.title.trim() && writeForm.content.trim()) ? styles.sheetSubmitActive : styles.sheetSubmitDisabled}`}
              onClick={handlePost}
            >
              <Send size={16} />
              등록하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
