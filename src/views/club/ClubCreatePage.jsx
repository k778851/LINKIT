'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClubStore } from '../../store/clubStore';
import { useAuthStore } from '../../store/authStore';
import { useToastContext } from '../../context/ToastContext';
import { Header } from '../../components/layout/Header';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { CATEGORY_COLORS } from '../../data/sampleData';
import { REGION_OPTIONS } from '../../data/regions';
import { isJipa } from '../../utils/permissions';
import styles from './ClubCreatePage.module.css';

const CATEGORIES = ['운동', '음식', '아트', '스터디', '음악', '기타'];
const SERVICE_REGIONS = REGION_OPTIONS.filter((region) => region !== '전체');
const JIPA_REGIONS = REGION_OPTIONS;
const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

/** 단일 블록 → "화·목요일 19:30" */
function formatBlock({ days, time }) {
  if (!days.length) return '';
  const dayStr = days.join('·') + '요일';
  return time ? `${dayStr} ${time}` : dayStr;
}

/** 전체 블록 배열 → "화·목요일 19:30 / 토요일 07:00" */
function formatScheduleBlocks(blocks) {
  return blocks.map(formatBlock).filter(Boolean).join(' / ');
}

export function ClubCreatePage() {
  const router = useRouter();
  const addClub = useClubStore((s) => s.addClub);
  const selectedRegion = useClubStore((s) => s.selectedRegion);
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToastContext();
  const jipaUser = isJipa(user);
  const regionOptions = jipaUser ? JIPA_REGIONS : SERVICE_REGIONS;
  const [form, setForm] = useState({
    name: '',
    category: '',
    serviceRegion: jipaUser ? '전체' : (selectedRegion && selectedRegion !== '전체' ? selectedRegion : '본부'),
    coverImage: null,
    description: '',
    isPrivate: false,
    tags: '',
    joinQuestion: '',
  });
  // 정기 일정 블록 배열 [{ days: [], time: '' }, ...]
  const [scheduleBlocks, setScheduleBlocks] = useState([{ days: [], time: '' }]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const toggleBlockDay = (idx, day) => {
    setScheduleBlocks((prev) => prev.map((b, i) =>
      i !== idx ? b : {
        ...b,
        days: b.days.includes(day) ? b.days.filter((d) => d !== day) : [...b.days, day],
      }
    ));
  };
  const setBlockTime = (idx, time) => {
    setScheduleBlocks((prev) => prev.map((b, i) => i !== idx ? b : { ...b, time }));
  };
  const addBlock = () => setScheduleBlocks((prev) => [...prev, { days: [], time: '' }]);
  const removeBlock = (idx) => setScheduleBlocks((prev) => prev.filter((_, i) => i !== idx));

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = '클럽 이름을 입력해주세요';
    if (form.name.length > 15) e.name = '최대 15자까지 입력할 수 있어요';
    if (!form.category) e.category = '카테고리를 선택해주세요';
    if (!form.description.trim()) e.description = '소개를 입력해주세요';
    if (form.description.length > 100) e.description = '최대 100자까지 입력할 수 있어요';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || submitting) return;
    setSubmitting(true);
    try {
      const parsedTags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 3);
      await addClub({
        ...form,
        schedule: formatScheduleBlocks(scheduleBlocks),
        location: form.serviceRegion,
        joinQuestion: form.isPrivate ? form.joinQuestion.trim() : '',
        tags: parsedTags,
        memberCount: 1,
        postCount: 0,
        posterImages: form.coverImage ? [form.coverImage] : [],
        createdBy: user?.id,
      });
      showToast('클럽 개설 요청이 완료되었습니다. 승인 후 개설돼요.', 'success');
      router.replace('/clubs');
    } catch {
      showToast('클럽 생성에 실패했어요. 다시 시도해주세요.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const colors = CATEGORY_COLORS[form.category] ?? ['#8EC6FF', '#0088FF'];
  const previewGrad = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
  const isValid = form.name.trim() && form.category && form.description.trim();

  return (
    <div className={styles.page}>
      <Header
        title="클럽 만들기"
        right={
          <button
            className={`${styles.submitHeaderBtn} ${isValid && !submitting ? styles.submitActive : ''}`}
            onClick={handleSubmit}
            disabled={submitting}
          >
            완료
          </button>
        }
      />

      <div className={styles.body}>
        <div className={styles.section}>
          <p className={styles.label}>커버 이미지 <span className={styles.optional}>(선택)</span></p>
          <ImageUpload
            value={form.coverImage}
            onChange={(url) => set('coverImage', url)}
            shape="square"
          />
        </div>

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
            <p className={styles.previewDesc}>{form.serviceRegion} · {form.description || '클럽 소개가 여기에 표시돼요'}</p>
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>클럽 이름 <span className={styles.req}>*</span></label>
          <input
            className={`${styles.input} ${errors.name ? styles.inputErr : ''}`}
            placeholder="한글, 영어, 숫자 최대 15자"
            maxLength={15}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
          {errors.name && <p className={styles.errMsg}>{errors.name}</p>}
          <p className={styles.counter}>{form.name.length}/15</p>
        </div>

        <div className={styles.section}>
          <p className={styles.label}>카테고리 <span className={styles.req}>*</span></p>
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
          {errors.category && <p className={styles.errMsg}>{errors.category}</p>}
        </div>

        <div className={styles.section}>
          <label className={styles.label}>소개 <span className={styles.req}>*</span></label>
          <textarea
            className={`${styles.textarea} ${errors.description ? styles.inputErr : ''}`}
            placeholder="클럽을 소개해주세요. (최대 100자)"
            maxLength={100}
            rows={3}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
          {errors.description && <p className={styles.errMsg}>{errors.description}</p>}
          <p className={styles.counter}>{form.description.length}/100</p>
        </div>

        <div className={styles.section}>
          <p className={styles.label}>정기 일정 <span className={styles.optional}>(선택)</span></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {scheduleBlocks.map((block, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-input, #f5f7fa)',
                borderRadius: 12,
                padding: '12px 14px',
                position: 'relative',
              }}>
                {/* 블록 삭제 버튼 */}
                {scheduleBlocks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBlock(idx)}
                    style={{
                      position: 'absolute', top: 8, right: 10,
                      background: 'none', border: 'none',
                      fontSize: 16, color: 'var(--ink-4)',
                      cursor: 'pointer', lineHeight: 1, padding: 2,
                    }}
                    aria-label="삭제"
                  >×</button>
                )}
                {/* 요일 선택 */}
                <div className={styles.chipRow} style={{ marginBottom: 10, flexWrap: 'wrap' }}>
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`${styles.chip} ${block.days.includes(day) ? styles.chipActive : ''}`}
                      style={{ minWidth: 36 }}
                      onClick={() => toggleBlockDay(idx, day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {/* 시간 선택 */}
                {block.days.length > 0 && (
                  <input
                    className={styles.input}
                    type="time"
                    value={block.time}
                    style={{ marginBottom: 0 }}
                    onChange={(e) => setBlockTime(idx, e.target.value)}
                  />
                )}
                {/* 블록 미리보기 */}
                {block.days.length > 0 && (
                  <p style={{ fontSize: 12, color: 'var(--blue)', marginTop: 6, fontWeight: 500 }}>
                    📅 {formatBlock(block)}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* 일정 추가 버튼 */}
          <button
            type="button"
            onClick={addBlock}
            style={{
              marginTop: 10,
              width: '100%',
              padding: '9px 0',
              borderRadius: 10,
              border: '1.5px dashed var(--ink-5, #d0d5dd)',
              background: 'transparent',
              color: 'var(--ink-3)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            + 일정 추가
          </button>

          {/* 전체 미리보기 */}
          {formatScheduleBlocks(scheduleBlocks) && (
            <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>
              최종: <strong style={{ color: 'var(--blue)' }}>{formatScheduleBlocks(scheduleBlocks)}</strong>
            </p>
          )}
        </div>

        <div className={styles.section}>
          <label className={styles.label}>
            해시태그 <span className={styles.optional}>(선택 · 최대 3개)</span>
          </label>
          <input
            className={styles.input}
            placeholder="쉼표로 구분해 입력하세요. 예: 러닝,주말,북구"
            value={form.tags}
            onChange={(e) => set('tags', e.target.value)}
          />
          <p className={styles.hint}>쉼표(,)로 구분하여 최대 3개 입력</p>
          {form.tags && (
            <div className={styles.tagPreview}>
              {form.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 3).map((t, i) => (
                <span key={i} className={styles.tagChip}>#{t}</span>
              ))}
            </div>
          )}
        </div>

        {jipaUser && (
          <div className={styles.section}>
            <p className={styles.label}>운영 지역</p>
            <div className={styles.chipRow}>
              {regionOptions.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`${styles.chip} ${form.serviceRegion === r ? styles.chipActive : ''}`}
                  onClick={() => set('serviceRegion', r)}
                >
                  {r}
                </button>
              ))}
            </div>
            {form.serviceRegion === '전체' && (
              <p className={styles.hint}>전체 지역에 노출되는 클럽으로 개설됩니다.</p>
            )}
          </div>
        )}

        <div className={styles.section}>
          <p className={styles.label}>가입 방식</p>
          <div className={styles.toggleRow}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${!form.isPrivate ? styles.toggleActive : ''}`}
              onClick={() => setForm((f) => ({ ...f, isPrivate: false, joinQuestion: '' }))}
            >
              전체 공개
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${form.isPrivate ? styles.toggleActive : ''}`}
              onClick={() => set('isPrivate', true)}
            >
              승인제
            </button>
          </div>
        </div>

        {form.isPrivate && (
          <div className={styles.section}>
            <label className={styles.label}>
              가입 질문 <span className={styles.optional}>(선택)</span>
            </label>
            <input
              className={styles.input}
              placeholder="신청자에게 물어볼 질문을 입력하세요"
              maxLength={100}
              value={form.joinQuestion}
              onChange={(e) => set('joinQuestion', e.target.value)}
            />
          </div>
        )}

        <button
          className={`${styles.submitBtn} ${isValid && !submitting ? styles.submitBtnActive : styles.submitBtnDisabled}`}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '만드는 중...' : '클럽 만들기'}
        </button>
      </div>
    </div>
  );
}
