'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClubStore } from '../../store/clubStore';
import { useAuthStore } from '../../store/authStore';
import { useToastContext } from '../../context/ToastContext';
import { Header } from '../../components/layout/Header';
import { EmptyState } from '../../components/common/EmptyState';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { CATEGORY_COLORS } from '../../data/sampleData';
import styles from './ClubEditPage.module.css';

const CATEGORIES = ['운동', '음식', '아트', '스터디', '음악', '기타'];

export function ClubEditPage({ clubId }) {
  const router = useRouter();
  const { showToast } = useToastContext();
  const club = useClubStore((s) => s.clubs.find((c) => c.id === clubId));
  const updateClub  = useClubStore((s) => s.updateClub);
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({
    name: '', category: '',
    coverImage: null,
    description: '', schedule: '', isPrivate: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (club) {
      setForm({
        name:        club.name,
        category:    club.category,
        coverImage:  club.coverImage ?? null,
        description: club.description,
        schedule:    club.schedule ?? '',
        isPrivate:   club.isPrivate ?? false,
      });
    }
  }, [clubId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!club) return <EmptyState emoji="😢" title="클럽을 찾을 수 없어요" />;
  if (club.createdBy !== user?.id) return <EmptyState emoji="🔒" title="클럽장만 수정할 수 있어요" />;

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = '클럽 이름을 입력하세요.';
    if (form.name.length > 20)    e.name        = '최대 20자까지 입력 가능해요.';
    if (!form.category)           e.category    = '카테고리를 선택하세요.';
    if (!form.description.trim()) e.description = '소개를 입력하세요.';
    if (form.description.length > 100) e.description = '최대 100자까지 입력 가능해요.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || submitting) return;
    setSubmitting(true);
    try {
      await updateClub(clubId, form);
      showToast(`${form.name} 정보를 수정했어요 ✏️`, 'success');
      router.replace(`/clubs/${clubId}`);
    } catch {
      showToast('수정에 실패했어요. 다시 시도해주세요.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 미리보기 그라디언트 (카테고리 기반)
  const colors = CATEGORY_COLORS[form.category] ?? ['#8EC6FF', '#0088FF'];
  const previewGrad = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
  const isValid = form.name.trim() && form.category && form.description.trim();

  return (
    <div className={styles.page}>
      <Header
        title="클럽 정보 수정"
        right={
          <button
            className={`${styles.saveBtn} ${isValid && !submitting ? styles.saveBtnActive : ''}`}
            onClick={handleSave}
            disabled={submitting}
          >
            저장
          </button>
        }
      />

      <div className={styles.body}>
        {/* 커버 이미지 업로드 */}
        <div className={styles.section}>
          <p className={styles.label}>커버 이미지 <span className={styles.optional}>(선택)</span></p>
          <ImageUpload
            value={form.coverImage}
            onChange={(url) => set('coverImage', url)}
            shape="square"
          />
        </div>

        {/* 미리보기 */}
        <div className={styles.previewCard}>
          <div
            className={styles.previewPoster}
            style={form.coverImage
              ? { backgroundImage: `url("${form.coverImage}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: previewGrad }}
          />
          <div className={styles.previewInfo}>
            {form.category && <span className={styles.previewCategory}>{form.category}</span>}
            <p className={styles.previewName}>{form.name || '클럽 이름'}</p>
            <p className={styles.previewDesc}>{form.description || '클럽 소개가 여기 표시돼요'}</p>
          </div>
        </div>

        {/* 클럽 이름 */}
        <div className={styles.section}>
          <label className={styles.label}>클럽 이름 <span className={styles.req}>*</span></label>
          <input className={`${styles.input} ${errors.name ? styles.inputErr : ''}`}
            placeholder="최대 20자" maxLength={20} value={form.name}
            onChange={(e) => set('name', e.target.value)} />
          {errors.name && <p className={styles.errMsg}>{errors.name}</p>}
          <p className={styles.counter}>{form.name.length}/20</p>
        </div>

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

        {/* 소개 */}
        <div className={styles.section}>
          <label className={styles.label}>소개 <span className={styles.req}>*</span></label>
          <textarea className={`${styles.textarea} ${errors.description ? styles.inputErr : ''}`}
            placeholder="클럽을 소개해 주세요. (최대 100자)" maxLength={100} rows={3}
            value={form.description} onChange={(e) => set('description', e.target.value)} />
          {errors.description && <p className={styles.errMsg}>{errors.description}</p>}
          <p className={styles.counter}>{form.description.length}/100</p>
        </div>


        {/* 정기 일정 */}
        <div className={styles.section}>
          <label className={styles.label}>정기 일정 <span className={styles.optional}>(선택)</span></label>
          <input className={styles.input} placeholder="예: 매주 금요일 20:00"
            value={form.schedule} onChange={(e) => set('schedule', e.target.value)} />
        </div>

        {/* 가입 방식 */}
        <div className={styles.section}>
          <p className={styles.label}>가입 방식</p>
          <div className={styles.toggleRow}>
            <button type="button"
              className={`${styles.toggleBtn} ${!form.isPrivate ? styles.toggleActive : ''}`}
              onClick={() => set('isPrivate', false)}>전체 공개</button>
            <button type="button"
              className={`${styles.toggleBtn} ${form.isPrivate ? styles.toggleActive : ''}`}
              onClick={() => set('isPrivate', true)}>승인제</button>
          </div>
        </div>

        <button
          className={`${styles.ctaBtn} ${isValid && !submitting ? styles.ctaActive : styles.ctaDisabled}`}
          onClick={handleSave}
          disabled={submitting}
        >
          {submitting ? '저장 중...' : '수정 완료'}
        </button>
      </div>
    </div>
  );
}
