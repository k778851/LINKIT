'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCommunityStore } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';
import { getPostDetailPath, getPostLookupId } from '../../lib/communityRoutes';
import { useToastContext } from '../../context/ToastContext';
import { Header } from '../../components/layout/Header';
import { EmptyState } from '../../components/common/EmptyState';
import styles from './PostEditPage.module.css';

const CATEGORIES = ['일상', '질문', '모임', '나눔', '생활정보'];

export function PostEditPage({ postId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lookupPostId = getPostLookupId(postId, searchParams.get('postId'));
  const { showToast } = useToastContext();
  const post = useCommunityStore((s) => s.posts.find((p) => p.id === lookupPostId));
  const updatePost  = useCommunityStore((s) => s.updatePost);
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({ category: '', title: '', content: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (post) {
      setForm({ category: post.category, title: post.title, content: post.content });
    }
  }, [lookupPostId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!post) return <EmptyState emoji="😢" title="게시글을 찾을 수 없어요" />;
  if (post.authorId !== user?.id) return <EmptyState emoji="🔒" title="수정 권한이 없어요" />;

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title   = '제목을 입력하세요.';
    if (form.title.length > 50) e.title = '제목은 최대 50자까지 입력 가능해요.';
    if (!form.content.trim()) e.content = '내용을 입력하세요.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || submitting) return;
    setSubmitting(true);
    try {
      await updatePost(lookupPostId, { category: form.category, title: form.title, content: form.content });
      showToast('게시글을 수정했어요 ✏️', 'success');
      router.replace(getPostDetailPath(lookupPostId));
    } catch {
      showToast('수정에 실패했어요. 다시 시도해주세요.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isChanged =
    form.title !== post.title ||
    form.content !== post.content ||
    form.category !== post.category;

  return (
    <div className={styles.page}>
      <Header
        title="게시글 수정"
        right={
          <button
            className={`${styles.saveBtn} ${isChanged && !submitting ? styles.saveBtnActive : ''}`}
            onClick={handleSave}
            disabled={!isChanged || submitting}
          >
            저장
          </button>
        }
      />

      <div className={styles.body}>
        {/* 카테고리 */}
        <div className={styles.section}>
          <p className={styles.label}>카테고리</p>
          <div className={styles.chipRow}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${styles.chip} ${form.category === cat ? styles.chipActive : ''}`}
                onClick={() => set('category', cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div className={styles.section}>
          <label className={styles.label}>제목</label>
          <input
            className={`${styles.input} ${errors.title ? styles.inputErr : ''}`}
            placeholder="제목을 입력하세요"
            maxLength={50}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
          {errors.title && <p className={styles.errMsg}>{errors.title}</p>}
          <p className={styles.counter}>{form.title.length}/50</p>
        </div>

        {/* 내용 */}
        <div className={styles.section}>
          <label className={styles.label}>내용</label>
          <textarea
            className={`${styles.textarea} ${errors.content ? styles.inputErr : ''}`}
            placeholder="내용을 입력하세요"
            maxLength={1000}
            rows={8}
            value={form.content}
            onChange={(e) => set('content', e.target.value)}
          />
          {errors.content && <p className={styles.errMsg}>{errors.content}</p>}
          <p className={styles.counter}>{form.content.length}/1000</p>
        </div>

        <button
          className={`${styles.ctaBtn} ${isChanged && !submitting ? styles.ctaActive : styles.ctaDisabled}`}
          onClick={handleSave}
          disabled={!isChanged || submitting}
        >
          {submitting ? '저장 중...' : '수정 완료'}
        </button>
      </div>
    </div>
  );
}
