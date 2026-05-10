'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { useClubStore } from '../../store/clubStore';
import { useAuthStore } from '../../store/authStore';
import { useToastContext } from '../../context/ToastContext';
import { Header } from '../../components/layout/Header';
import { EmptyState } from '../../components/common/EmptyState';
import styles from './ScheduleCreatePage.module.css';

export function ScheduleCreatePage({ clubId }) {
  const router = useRouter();
  const club = useClubStore((s) => s.clubs.find((c) => c.id === clubId));
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToastContext();

  const [form, setForm] = useState({
    title: '',
    location: '',
    date: '',
    time: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // 방장만 접근 가능
  if (!club) return null;
  if (club.createdBy !== user?.id) {
    return (
      <EmptyState
        emoji="🔒"
        title="권한이 없어요"
        description="모임 개설은 클럽 방장만 할 수 있어요."
      />
    );
  }

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const isValid = form.title.trim() && form.location.trim() && form.date;

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      // 일정 저장 (오프라인: 로컬 스토어에 추가)
      const newSchedule = {
        id: `sch-${Date.now()}`,
        clubId,
        clubName: club.name,
        title: form.title,
        location: form.location,
        time: form.time || '00:00',
        startAt: new Date(`${form.date}T${form.time || '00:00'}:00`).toISOString(),
        description: form.description,
      };
      // schedules 로컬 추가
      useClubStore.setState((s) => ({ schedules: [...s.schedules, newSchedule] }));
      showToast('모임이 개설되었습니다. 🎉', 'success');
      router.back();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <Header title="모임 개설하기" />

      <div className={styles.body}>
        {/* 클럽 표시 */}
        <div className={styles.clubBadge}>
          <span className={styles.clubName}>{club.name}</span>
        </div>

        {/* 모임 이름 */}
        <div className={styles.section}>
          <label className={styles.label}>모임 이름 <span className={styles.req}>*</span></label>
          <input
            className={styles.input}
            placeholder="이번 모임의 이름을 입력하세요"
            maxLength={30}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </div>

        {/* 날짜 */}
        <div className={styles.section}>
          <label className={styles.label}>날짜 <span className={styles.req}>*</span></label>
          <input
            className={styles.input}
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </div>

        {/* 시간 */}
        <div className={styles.section}>
          <label className={styles.label}>시간 <span className={styles.optional}>(선택)</span></label>
          <input
            className={styles.input}
            type="time"
            value={form.time}
            onChange={(e) => set('time', e.target.value)}
          />
        </div>

        {/* 장소 */}
        <div className={styles.section}>
          <label className={styles.label}>
            <MapPin size={13} style={{ verticalAlign: 'middle', marginRight: 2 }} />
            장소 <span className={styles.req}>*</span>
          </label>
          <input
            className={styles.input}
            placeholder="예: 여의도 한강공원"
            maxLength={50}
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
          />
          {form.location && (
            <p className={styles.locationHint}>
              📍 {form.location}
            </p>
          )}
        </div>

        {/* 설명 */}
        <div className={styles.section}>
          <label className={styles.label}>모임 설명 <span className={styles.optional}>(선택)</span></label>
          <textarea
            className={styles.textarea}
            placeholder="이번 모임에 대해 설명해주세요"
            rows={4}
            maxLength={200}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
          <p className={styles.counter}>{form.description.length}/200</p>
        </div>
      </div>

      {/* 하단 CTA */}
      <div className={styles.ctaWrap}>
        <button
          className={`${styles.ctaBtn} ${isValid && !submitting ? styles.ctaActive : ''}`}
          onClick={handleSubmit}
          disabled={!isValid || submitting}
        >
          {submitting ? '개설 중...' : '모임 개설하기'}
        </button>
      </div>
    </div>
  );
}
