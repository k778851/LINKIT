'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCommunityStore } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';
import { Header } from '../../components/layout/Header';
import { useToastContext } from '../../context/ToastContext';
import { ImageUpload } from '../../components/ui/ImageUpload';
import styles from './PostCreatePage.module.css';

const CATEGORIES = ['일상', '질문', '모임', '나눔', '생활정보'];

export function PostCreatePage() {
  const router = useRouter();
  const addPost = useCommunityStore((s) => s.addPost);
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({ category: '', title: '', content: '', location: '', image: null });
  const [errors, setErrors] = useState({});
  const { showToast } = useToastContext();

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const isValid = form.category && form.title.trim() && form.content.trim();

  const validate = () => {
    const e = {};
    if (!form.category) e.category = '카테고리를 선택하세요.';
    if (!form.title.trim()) e.title = '제목을 입력하세요.';
    if (form.title.length > 50) e.title = '최대 50자까지 입력 가능해요.';
    if (!form.content.trim()) e.content = '내용을 입력하세요.';
    if (form.content.length > 500) e.content = '최대 500자까지 입력 가능해요.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    addPost({
      ...form,
      authorId: user?.id,
      authorNickname: user?.nickname ?? '익명',
      authorEmoji: user?.emoji ?? '😊',
      location: form.location.trim() || undefined,
    });
    showToast('게시글을 등록했어요 🎉', 'success');
    router.replace('/community');
  };

  return (
    <div className={styles.page}>
      <Header title="글쓰기" right={
        <button
          className={`${styles.submitBtn} ${isValid ? styles.submitActive : ''}`}
          onClick={handleSubmit}
        >
          등록
        </button>
      } />

      <div className={styles.body}>
        {/* 카테고리 */}
        <div className={styles.section}>
          <p className={styles.label}>카테고리 <span className={styles.req}>*</span></p>
          <div className={styles.chipRow}>
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button"
                className={`${styles.chip} ${form.category === cat ? styles.chipActive : ''}`}
                onClick={() => set('category', cat)}>
                {cat}
              </button>
            ))}
          </div>
          {errors.category && <p className={styles.errMsg}>{errors.category}</p>}
        </div>

        {/* 제목 */}
        <div className={styles.section}>
          <label className={styles.label}>제목 <span className={styles.req}>*</span></label>
          <input className={`${styles.input} ${errors.title ? styles.inputErr : ''}`}
            placeholder="제목을 입력하세요 (최대 50자)" maxLength={50}
            value={form.title} onChange={(e) => set('title', e.target.value)} />
          {errors.title && <p className={styles.errMsg}>{errors.title}</p>}
          <p className={styles.counter}>{form.title.length}/50</p>
        </div>

        {/* 내용 */}
        <div className={styles.section}>
          <label className={styles.label}>내용 <span className={styles.req}>*</span></label>
          <textarea className={`${styles.textarea} ${errors.content ? styles.inputErr : ''}`}
            placeholder="내용을 입력하세요 (최대 500자)" maxLength={500} rows={8}
            value={form.content} onChange={(e) => set('content', e.target.value)} />
          {errors.content && <p className={styles.errMsg}>{errors.content}</p>}
          <p className={styles.counter}>{form.content.length}/500</p>
        </div>

        {/* 사진 */}
        <div className={styles.section}>
          <label className={styles.label}>
            사진 <span className={styles.optional}>(선택)</span>
          </label>
          <ImageUpload
            value={form.image}
            onChange={(url) => set('image', url)}
            shape="rect"
            placeholder="📷"
          />
        </div>

        {/* 위치 */}
        <div className={styles.section}>
          <label className={styles.label}>
            위치 <span className={styles.optional}>(선택{form.category === '생활정보' ? ' · 권장' : ''})</span>
          </label>
          <input className={styles.input}
            placeholder="동네, 장소명 등 (최대 20자)" maxLength={20}
            value={form.location} onChange={(e) => set('location', e.target.value)} />
        </div>

        <button
          className={`${styles.ctaBtn} ${isValid ? styles.ctaActive : styles.ctaDisabled}`}
          onClick={handleSubmit}
        >
          등록하기
        </button>
      </div>
    </div>
  );
}
