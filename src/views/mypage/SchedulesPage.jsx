'use client';

import { useClubStore } from '../../store/clubStore';
import { useAuthStore } from '../../store/authStore';
import { Header } from '../../components/layout/Header';
import { calcDdayNum, getDdayLabel, formatShortDate } from '../../utils/formatDate';
import styles from './SchedulesPage.module.css';

export function SchedulesPage() {
  const allSchedules = useClubStore((s) => s.schedules);
  const user = useAuthStore((s) => s.user);

  // 참여 중인 클럽의 일정만, D-day 오름차순
  const upcoming = allSchedules
    .filter((s) => user?.joinedClubs?.includes(s.clubId))
    .map((s) => ({ ...s, dday: calcDdayNum(s.startAt) }))
    .sort((a, b) => a.dday - b.dday);

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
