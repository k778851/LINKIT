'use client';

import { useState, useEffect } from 'react';
import { useClubStore } from '../../store/clubStore';
import { useAuthStore } from '../../store/authStore';
import { scheduleApi } from '../../api/scheduleApi';
import { ApiError } from '../../api/apiClient';
import { Header } from '../../components/layout/Header';
import { calcDdayNum, getDdayLabel, formatShortDate } from '../../utils/formatDate';
import styles from './SchedulesPage.module.css';

export function SchedulesPage() {
  const allSchedules = useClubStore((s) => s.schedules);
  const user = useAuthStore((s) => s.user);
  const [apiSchedules, setApiSchedules] = useState(null); // null = 미로드
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    scheduleApi.getMine()
      .then((data) => setApiSchedules(data))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 0) {
          setApiSchedules(null); // 오프라인 → 로컬 fallback
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // API 결과가 있으면 우선 사용, 없으면 로컬 store fallback
  const rawSchedules = apiSchedules ?? allSchedules.filter(
    (s) => user?.joinedClubs?.includes(s.clubId)
  );

  const upcoming = rawSchedules
    .map((s) => ({ ...s, dday: calcDdayNum(s.startAt) }))
    .sort((a, b) => a.dday - b.dday);

  if (loading) {
    return (
      <div className={styles.page}>
        <Header title="내 모임 일정" />
        <div className={styles.list}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.card} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-title" style={{ width: '60%' }} />
                <div className="skeleton skeleton-text" style={{ width: '45%' }} />
                <div className="skeleton skeleton-text" style={{ width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header title="내 모임 일정" />

      {upcoming.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>📅</p>
          <p className={styles.emptyTitle}>예정된 일정이 없어요</p>
          <p className={styles.emptyDesc}>클럽 모임에 신청해보세요!</p>
        </div>
      ) : (
        <div className={styles.list}>
          {upcoming.map((sch) => {
            const isToday = sch.dday === 0;
            const isPast = sch.dday < 0;
            return (
              <div key={sch.id} className={`${styles.card} ${isToday ? styles.cardToday : ''} ${isPast ? styles.cardPast : ''}`}>
                {/* D-day 뱃지 */}
                <div className={`${styles.ddayBadge} ${isToday ? styles.ddayToday : isPast ? styles.ddayPast : ''}`}>
                  <span className={styles.ddayNum}>{getDdayLabel(sch.dday)}</span>
                  <span className={styles.ddayDate}>{formatShortDate(sch.startAt)}</span>
                </div>

                {/* 일정 정보 */}
                <div className={styles.info}>
                  <div className={styles.clubRow}>
                    <span className={styles.clubEmoji}>{sch.clubEmoji}</span>
                    <span className={styles.clubName}>{sch.clubName}</span>
                    {isToday && <span className={styles.todayBadge}>오늘!</span>}
                  </div>
                  <p className={styles.meta}>🕐 {sch.time}</p>
                  <p className={styles.meta}>📍 {sch.location}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
